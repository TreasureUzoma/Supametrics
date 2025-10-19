import { Hono } from "hono";
import { db } from "../db/index.js";
import { teams, teamMembers } from "../db/schema.js";
import { user } from "../db/auth-schema.js";
import { eq, and } from "drizzle-orm";
import { getUserOrNull } from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";

const teamRoutes = new Hono<{ Variables: AuthType }>();

// get (/teams)
teamRoutes.get("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  const results = await db
    .select({ team: teams, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.uuid))
    .where(eq(teamMembers.userId, currentUser!.uuid));

  return c.json({
    success: true,
    data: { teams: results.map((r) => ({ ...r.team, role: r.role })) },
    message: "Teams fetched successfully",
  });
});

// post (/teams)
teamRoutes.post("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  if (!currentUser?.uuid)
    return c.json({ success: false, message: "Unauthorized" }, 401);

  const [dbUser] = await db
    .select({ subscriptionType: user.subscriptionType })
    .from(user)
    .where(eq(user.uuid, currentUser.uuid))
    .limit(1);

  if (!dbUser)
    return c.json({ success: false, message: "User not found" }, 404);

  if (dbUser.subscriptionType === "free")
    return c.json(
      { success: false, message: "Upgrade to Pro to create teams" },
      403
    );

  const { name } = await c.req.json();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const [team] = await db
    .insert(teams)
    .values({ name, slug, ownerId: currentUser.uuid })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.uuid,
    userId: currentUser.uuid,
    role: "owner",
  });

  return c.json({ success: true, team });
});

//  PATCH /teams/:id
// Update team name (only owner)
teamRoutes.patch("/:id", async (c) => {
  const currentUser = await getUserOrNull(c);
  const id = c.req.param("id");
  const { name } = await c.req.json();
  if (name.length < 5 || name.length > 32) {
    return c.json({
      success: false,
    });
  }

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser!.uuid))
    )
    .limit(1);

  if (!membership || membership.role !== "owner")
    return c.json({ success: false, message: "Enter a valid team name" }, 400);

  await db.update(teams).set({ name }).where(eq(teams.uuid, id));
  return c.json({ success: true, message: "Team name updated" });
});

// DELETE /teams/:id/members/:memberId
// Remove a member (only owner)
teamRoutes.delete("/:id/members/:memberId", async (c) => {
  const currentUser = await getUserOrNull(c);
  const { id, memberId } = c.req.param();

  // Check if current user is owner
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser!.uuid))
    )
    .limit(1);

  if (!membership || membership.role !== "owner")
    return c.json(
      { success: false, message: "Only owners can remove members" },
      403
    );

  // Prevent removing yourself
  if (memberId === currentUser!.uuid)
    return c.json(
      { success: false, message: "Owner cannot remove themselves" },
      400
    );

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, id), eq(teamMembers.userId, memberId)));

  return c.json({ success: true, message: "Member removed" });
});

// POST /teams/:id/invite
//  Send invite to email — if you have invites table
teamRoutes.post("/:id/invite", async (c) => {
  const currentUser = await getUserOrNull(c);
  const id = c.req.param("id");
  const { email, role } = await c.req.json();

  // Check auth
  if (!currentUser)
    return c.json({ success: false, message: "Unauthorized" }, 401);

  // Confirm current user is owner
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser.uuid))
    )
    .limit(1);

  if (!membership || membership.role !== "owner")
    return c.json(
      { success: false, message: "Only owners can invite members" },
      403
    );

  // Find target user by email
  const [targetUser] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!targetUser)
    return c.json({ success: false, message: "User not found" }, 404);

  // Check if user already in team
  const [existingMember] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, targetUser.uuid))
    )
    .limit(1);

  if (existingMember)
    return c.json({ success: false, message: "User already in team" }, 400);

  // Add user directly to team
  await db.insert(teamMembers).values({
    teamId: id,
    userId: targetUser.uuid,
    role: role ?? "member",
  });

  return c.json({
    success: true,
    message: `Added ${email} to team successfully`,
  });
});

teamRoutes.get("/:id/members", async (c) => {
  const currentUser = await getUserOrNull(c);
  const id = c.req.param("id");

  if (!currentUser)
    return c.json({ success: false, message: "Unauthorized" }, 401);

  // Verify user is part of this team
  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser.uuid))
    )
    .limit(1);

  if (!membership)
    return c.json(
      { success: false, message: "You’re not a member of this team" },
      403
    );

  // Fetch all members with user details
  const members = await db
    .select({
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: teamMembers.role,
    })
    .from(teamMembers)
    .innerJoin(user, eq(teamMembers.userId, user.uuid))
    .where(eq(teamMembers.teamId, id));

  return c.json({
    success: true,
    data: { members },
    message: "Team members fetched successfully",
  });
});

// POST /teams/:id/leave
// Leave a team (cannot if owner)
teamRoutes.post("/:id/leave", async (c) => {
  const currentUser = await getUserOrNull(c);
  const id = c.req.param("id");

  const [membership] = await db
    .select()
    .from(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser!.uuid))
    )
    .limit(1);

  if (!membership)
    return c.json({ success: false, message: "You are not in this team" }, 400);

  if (membership.role === "owner")
    return c.json(
      { success: false, message: "Owner cannot leave their own team" },
      400
    );

  await db
    .delete(teamMembers)
    .where(
      and(eq(teamMembers.teamId, id), eq(teamMembers.userId, currentUser!.uuid))
    );

  return c.json({ success: true, message: "Left team successfully" });
});

export default teamRoutes;

import { Hono } from "hono";
import { db } from "../db/index.js";
import { teams, teamMembers } from "../db/schema.js";
import { nanoid } from "nanoid";
import { user } from "../db/auth-schema.js";
import { eq } from "drizzle-orm";
import { getUserOrNull } from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";

const teamRoutes = new Hono<{ Variables: AuthType }>();

// GET /teams - all teams user is in
teamRoutes.get("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  const results = await db
    .select({ team: teams, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.uuid))
    .where(eq(teamMembers.userId, currentUser!.uuid));

  return c.json({
    success: true,
    teams: results.map((r) => ({ ...r.team, role: r.role })),
  });
});

// POST /teams - create new team (only for paid users)
teamRoutes.post("/", async (c) => {
  const currentUser = await getUserOrNull(c);

  // Validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // Fetch subscription type fresh from DB
  const [dbUser] = await db
    .select({ subscriptionType: user.subscriptionType })
    .from(user)
    .where(eq(user.uuid, currentUser.uuid))
    .limit(1);

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  if (dbUser.subscriptionType === "free") {
    return c.json({ error: "Upgrade to Pro to create teams" }, 403);
  }

  const { name } = await c.req.json();
  const slug = name.toLowerCase().replace(/\s+/g, "-");

  const [team] = await db
    .insert(teams)
    .values({
      uuid: nanoid(),
      name,
      slug,
      ownerId: currentUser.uuid,
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.uuid,
    userId: currentUser.uuid,
    role: "owner",
  });

  return c.json({ success: true, team });
});

export default teamRoutes;

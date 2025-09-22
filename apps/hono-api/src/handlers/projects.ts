import { Hono } from "hono";
import { db } from "../db/index.js";
import {
  analyticsEvents,
  projectApiKeys,
  projectMembers,
  projects,
  teams,
} from "../db/schema.js";
import { user } from "../db/auth-schema.js";
import { eq, and, isNull, count, or } from "drizzle-orm";
import { createProjectSchema, isValidUUID } from "@/lib/zod.js";
import { slugifyProjectName } from "../lib/slugify.js";
import { generateApiKeys, getPaginationParams } from "../lib/utils.js";
import {
  getUserOrNull,
  getProjectOrNull,
  getProjectMembership,
  isOwnerOrAdmin,
} from "../helpers/projects.js";
import type { AuthType } from "../lib/auth.js";

const projectRoutes = new Hono<{ Variables: AuthType }>();

// create new project
projectRoutes.post("/new", async (c) => {
  const currentUser = await getUserOrNull(c);

  // validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error.format() }, 400);

  const { name, description, teamId } = parsed.data;
  const slugBase = slugifyProjectName(name);

  let finalSlug = slugBase;
  let count = 1;

  while (true) {
    const existing = await db
      .select()
      .from(projects)
      .where(eq(projects.slug, finalSlug));
    if (existing.length === 0) break;
    finalSlug = `${slugBase}-${count++}`;
  }

  const [userInfo] = await db
    .select()
    .from(user)
    .where(eq(user.uuid, currentUser.uuid));
  if (!userInfo) return c.json({ error: "User not found" }, 404);

  if (!teamId) {
    const personalProjects = await db
      .select()
      .from(projects)
      .where(
        and(eq(projects.userId, currentUser.uuid), isNull(projects.teamId))
      );

    if (userInfo.subscriptionType === "free" && personalProjects.length >= 5)
      return c.json({ error: "Free plan limit reached" }, 403);

    const [project] = await db
      .insert(projects)
      .values({
        userId: currentUser.uuid,
        name,
        slug: finalSlug,
        description,
        url: parsed.data.url,
        type: parsed.data.type,
      })
      .returning();

    const { publicKey, secretKey } = generateApiKeys();
    await db
      .insert(projectApiKeys)
      .values({ projectId: project.uuid, publicKey, secretKey });
    await db.insert(projectMembers).values({
      projectId: project.uuid,
      userId: currentUser.uuid,
      role: "admin",
    });

    return c.json({ success: true, project });
  }

  const [teamInfo] = await db
    .select()
    .from(teams)
    .where(eq(teams.uuid, teamId));
  if (!teamInfo) return c.json({ error: "Team not found" }, 404);

  const teamProjects = await db
    .select()
    .from(projects)
    .where(eq(projects.teamId, teamId));

  if (userInfo.subscriptionType === "free" && teamProjects.length >= 5)
    return c.json(
      { error: "Team free plan limit reached (user's plan applies)" },
      403
    );

  if (userInfo.subscriptionType === "free")
    return c.json({ error: "Upgrade your account to pro to continue" }, 403);

  const [project] = await db
    .insert(projects)
    .values({ teamId, name, slug: finalSlug, description })
    .returning();

  await db.insert(projectMembers).values({
    projectId: project.uuid,
    userId: currentUser.uuid,
    role: "admin",
  });

  const { publicKey, secretKey } = generateApiKeys();
  await db
    .insert(projectApiKeys)
    .values({ projectId: project.uuid, publicKey, secretKey });

  return c.json({ success: true, project });
});

// get all projects
projectRoutes.get("/", async (c) => {
  try {
    const currentUser = await getUserOrNull(c);

    const userId = currentUser!.uuid;
    const { page, limit, offset } = getPaginationParams(c);

    const search = c.req.query("search")?.toLowerCase() || "";
    const type = c.req.query("type"); // 'personal' | 'team' | undefined
    const teamId = c.req.query("teamId");
    const sort = c.req.query("sort") || "newest"; // 'newest' or 'oldest'

    let allProjects: any[] = [];

    if (type === "team") {
      if (!teamId) {
        return c.json(
          {
            success: false,
            message: "teamId is required when filtering by team projects",
            data: [],
          },
          400
        );
      }

      if (!isValidUUID.safeParse(teamId).success) {
        return c.json({ success: false, message: "Invalid teamId UUID" }, 400);
      }

      allProjects = await db
        .select({ project: projects, role: projectMembers.role })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.uuid))
        .where(
          and(eq(projectMembers.userId, userId), eq(projects.teamId, teamId))
        )
        .then((rows) => rows.map((r) => ({ ...r.project, role: r.role })));
    } else {
      // Fetch projects once, left-joining projectMembers for the current user (if any).
      const rows = await db
        .select({
          project: projects,
          memberRole: projectMembers.role,
        })
        .from(projects)
        .leftJoin(
          projectMembers,
          and(
            eq(projectMembers.projectId, projects.uuid),
            eq(projectMembers.userId, userId) // only join the current user's membership row
          )
        )
        .where(
          or(
            eq(projects.userId, userId), // owner
            eq(projectMembers.userId, userId) // member (joined row)
          )
        );

      allProjects = rows.map((r: any) => ({
        ...r.project,
        role:
          r.project.userId === userId
            ? ("owner" as const)
            : (r.memberRole ?? "member"),
      }));
    }

    if (search) {
      allProjects = allProjects.filter((p) =>
        p.name.toLowerCase().includes(search)
      );
    }

    allProjects.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const paginatedProjects = allProjects.slice(offset, offset + limit);

    const visitorCounts = await db
      .select({
        projectId: analyticsEvents.projectId,
        total: count(),
      })
      .from(analyticsEvents)
      .groupBy(analyticsEvents.projectId);

    const status = "active"; // fixed status for now

    const countsMap = Object.fromEntries(
      visitorCounts.map((r) => [r.projectId, r.total])
    );

    const projectsWithCounts = paginatedProjects.map((p) => ({
      ...p,
      visitors: countsMap[p.uuid] ?? 0,
      status,
    }));

    return c.json({
      success: true,
      message: "Projects fetched successfully",
      data: { projects: projectsWithCounts },
      pagination: { page, limit, total: allProjects.length },
    });
  } catch (err: any) {
    console.error("Failed to fetch projects:", err);
    return c.json(
      {
        success: false,
        message: err?.message ?? "Failed to fetch projects",
        data: [],
      },
      500
    );
  }
});

// Rotate key
projectRoutes.post("/:id/rotate-key", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrNull(projectId);

  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!project) {
    return c.json({ error: "Project missing" }, 401);
  }

  if (!(await isOwnerOrAdmin(project, currentUser.uuid)))
    return c.json({ error: "Forbidden" }, 403);

  await db
    .delete(projectApiKeys)
    .where(eq(projectApiKeys.projectId, projectId));

  const keys = generateApiKeys();
  await db.insert(projectApiKeys).values({ projectId, ...keys });

  return c.json({ success: true, apiKey: keys });
});

// Delete project
projectRoutes.delete("/:id", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrNull(projectId)!;

  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!project) {
    return c.json({ error: "Project cannot be null" }, 401);
  }

  if (project.userId && project?.userId !== currentUser.uuid)
    return c.json({ error: "Forbidden" }, 403);

  if (project.teamId) {
    const member = await getProjectMembership(project?.uuid, currentUser.uuid);
    if (!member || member.role !== "admin")
      return c.json({ error: "Only admins can delete this project" }, 403);
  }

  await db.delete(projects).where(eq(projects.uuid, projectId));
  return c.json({ success: true });
});

// read overview
projectRoutes.get("/:id", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrNull(projectId);

  let role: "owner" | "admin" | "editor" | "viewer" = "viewer";

  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!project) {
    return c.json({ error: "Project cannot be null" }, 403);
  }

  if (project.userId === currentUser.uuid) {
    role = "admin";
  } else if (project.teamId) {
    const membership = await getProjectMembership(
      project.uuid,
      currentUser.uuid
    );
    if (!membership || !membership.role)
      return c.json({ error: "Not a member of this project" }, 403);
    role = membership.role;
  }

  const apiKeys =
    role === "admin" || role === "editor"
      ? await db
          .select({
            publicKey: projectApiKeys.publicKey,
            secretKey: projectApiKeys.secretKey,
            revoked: projectApiKeys.revoked,
          })
          .from(projectApiKeys)
          .where(eq(projectApiKeys.projectId, project.uuid))
      : undefined;

  return c.json({ success: true, project, role, apiKeys });
});

// Invite to project
projectRoutes.post("/:id/invite", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const { email, role } = await c.req.json();

  if (!["admin", "editor", "viewer"].includes(role))
    return c.json({ error: "Invalid role" }, 400);

  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const membership = await getProjectMembership(projectId, currentUser.uuid);
  if (!membership || membership.role !== "admin")
    return c.json({ error: "Only admins can invite" }, 403);

  return c.json({
    success: true,
    message: `Invite to ${email} with role ${role} created (not sent)`,
  });
});

// Edit member role
projectRoutes.patch("/:id/role", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const { targetUserId, newRole } = await c.req.json();

  if (!["admin", "editor", "viewer"].includes(newRole))
    return c.json({ error: "Invalid role" }, 400);

  // validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const membership = await getProjectMembership(projectId, currentUser.uuid);
  if (!membership || membership.role !== "admin")
    return c.json({ error: "Only admins can update roles" }, 403);

  await db
    .update(projectMembers)
    .set({ role: newRole })
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, targetUserId)
      )
    );

  return c.json({ success: true });
});

// patch (update)
projectRoutes.patch("/:id", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const { name, description } = await c.req.json();

  const project = await getProjectOrNull(projectId);

  // Validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!project) {
    return c.json({ error: "Project cannot be null" }, 403);
  }

  const isAdminOrOwner =
    project.userId === currentUser.uuid ||
    (project.teamId &&
      (await getProjectMembership(projectId, currentUser.uuid))?.role ===
        "admin");

  if (!isAdminOrOwner) {
    return c.json({ error: "Only admins can update project" }, 403);
  }

  await db
    .update(projects)
    .set({ ...(name && { name }), ...(description && { description }) })
    .where(eq(projects.uuid, projectId));

  return c.json({ success: true });
});

// get project members
projectRoutes.get("/:id/members", async (c) => {
  const currentUser = await getUserOrNull(c);
  const projectId = c.req.param("id");
  const project = await getProjectOrNull(projectId);

  // validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  if (!project) {
    return c.json({ error: "Project cannot be null" }, 403);
  }

  // Ensure current user is part of the project
  if (project.userId !== currentUser.uuid) {
    const membership = await getProjectMembership(projectId, currentUser.uuid);
    if (!membership) return c.json({ error: "Forbidden" }, 403);
  }

  const members = await db
    .select({
      userId: projectMembers.userId,
      role: projectMembers.role,
    })
    .from(projectMembers)
    .where(eq(projectMembers.projectId, projectId));

  if (project.userId) {
    members.push({
      userId: project.userId,
      role: "admin",
    });
  }

  return c.json({ success: true, members });
});

// leave project
projectRoutes.delete("/:id/leave", async (c) => {
  const currentUser = await getUserOrNull(c);

  // Validate authentication
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const projectId = c.req.param("id");
  const membership = await getProjectMembership(projectId, currentUser.uuid);

  if (!membership)
    return c.json({ error: "You are not a member of this project" }, 400);

  if (membership.role === "admin")
    return c.json({ error: "Admins cannot leave the project" }, 403);

  await db
    .delete(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, currentUser.uuid)
      )
    );

  return c.json({ success: true });
});

export default projectRoutes;

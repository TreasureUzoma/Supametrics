import type { Context } from "hono";
import { db } from "../db/index.js";
import { projects, projectMembers } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import type { AuthType } from "../lib/auth.js";

export type Project = typeof projects.$inferSelect;
export type ProjectMember = typeof projectMembers.$inferSelect;
export type User = AuthType["user"];

export enum ProjectRole {
  Owner = "owner",
  Admin = "admin",
  Member = "member",
}

export async function getUserOrNull(
  c: Context<{ Variables: AuthType }>
): Promise<User | null> {
  const user = c?.get("user");
  return user ?? null;
}

export async function getProjectOrNull(
  projectId: string
): Promise<Project | null> {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.uuid, projectId));
  return project ?? null;
}

export async function getProjectMembership(
  projectId: string,
  userId?: string
): Promise<ProjectMember | null> {
  if (!userId) return null;
  const [membership] = await db
    .select()
    .from(projectMembers)
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.userId, userId)
      )
    );
  return membership ?? null;
}

export async function isAdmin(
  projectId: string,
  userId: string
): Promise<boolean> {
  const membership = await getProjectMembership(projectId, userId);
  return membership?.role === ProjectRole.Admin;
}

export async function isOwnerOrAdmin(
  project: Project,
  userId: string
): Promise<boolean> {
  if (project.userId === userId) return true; // Owner
  const membership = await getProjectMembership(project.uuid, userId);
  return membership?.role === ProjectRole.Admin;
}

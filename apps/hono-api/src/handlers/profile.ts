import { Hono } from "hono";
import { db } from "../db/index.js";
import { user } from "../db/auth-schema.js";
import { eq } from "drizzle-orm";
import { updateProfileSchema } from "@repo/ui/lib/zod.js";
import type { AuthType } from "../lib/auth.js";
import { getUserOrNull } from "../helpers/projects.js";

const profileRoute = new Hono<{ Variables: AuthType }>();

// View profile
profileRoute.get("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const [profile] = await db
    .select({
      id: user.id,
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      image: user.image,
      status: user.status,
      role: user.role,
      subscriptionType: user.subscriptionType,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    })
    .from(user)
    .where(eq(user.uuid, currentUser.uuid));

  if (!profile) {
    return c.json({ error: "Profile not found" }, 404);
  }

  return c.json(profile);
});

// Update profile (patch)
profileRoute.patch("/", async (c) => {
  const currentUser = await getUserOrNull(c);
  if (!currentUser?.uuid) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const body = await c.req.json();
  const parsed = updateProfileSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const [updatedUser] = await db
    .update(user)
    .set({
      ...parsed.data,
      updatedAt: new Date(),
    })
    .where(eq(user.uuid, currentUser.uuid))
    .returning({
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });

  return c.json(updatedUser);
});

export default profileRoute;

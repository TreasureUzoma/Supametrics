import { Hono } from "hono";
import { db } from "../db/index.js";
import { revokedTokens } from "../db/auth-schema.js";
import { eq } from "drizzle-orm";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { cookieOpts } from "@/helpers/cookie-opts.js";
import type { AuthType } from "../lib/auth.js";
import { JWT_SECRET, REFRESH_SECRET } from "./auth.js";
import { getUserOrNull } from "@/helpers/projects.js";
import { teamMembers, teams } from "@/db/schema.js";

const sessionHandler = new Hono<{ Variables: AuthType }>();

if (!JWT_SECRET) throw new Error("AUTH_SECRET not set");
if (!REFRESH_SECRET) throw new Error("REFRESH_SECRET not set");

// Session endpoint
sessionHandler.get("/", async (c) => {
  const currentUser = await getUserOrNull(c);

  const userTeams = await db
    .select({ team: teams, role: teamMembers.role })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.uuid))
    .where(eq(teamMembers.userId, currentUser!.uuid));

  return c.json(
    {
      success: true,
      message: "Session Active",
      data: { user: currentUser, teams: userTeams },
    },
    200
  );
});

// Signout endpoint
sessionHandler.get("/signout", async (c) => {
  try {
    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");

    deleteCookie(c, "auth", cookieOpts);
    deleteCookie(c, "refresh", cookieOpts);

    if (refresh) {
      +(await db
        .update(revokedTokens)
        .set({ revoked: true })
        .where(eq(revokedTokens.token, refresh)));
    }

    return c.json({ success: true, message: "Signed out", data: null }, 200);
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to sign out", data: null },
      500
    );
  }
});

export default sessionHandler;

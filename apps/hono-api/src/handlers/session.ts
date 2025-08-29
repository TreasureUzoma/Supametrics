import { Hono } from "hono";
import { db } from "../db/index.js";
import { revokedTokens, user } from "../db/auth-schema.js";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { revokeSessionSchema } from "@/lib/zod.js";
import { cookieOpts } from "@/helpers/cookie-opts.js";
import type { AuthType } from "../lib/auth.js";

const sessionHandler = new Hono<{ Variables: AuthType }>();

const JWT_SECRET = process.env.AUTH_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

if (!JWT_SECRET) throw new Error("AUTH_SECRET not set");
if (!REFRESH_SECRET) throw new Error("REFRESH_SECRET not set");

// Session endpoint
sessionHandler.get("/session", async (c) => {
  try {
    let token = await getSignedCookie(c, JWT_SECRET, "auth");
    let userFromDb = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { uuid: string };
        const rows = await db
          .select()
          .from(user)
          .where(eq(user.uuid, decoded.uuid))
          .limit(1);
        userFromDb = rows[0];
      } catch (e) {
        // Token is invalid or expired, proceed to check refresh token
        token = "";
      }
    }

    // No access token, try to use refresh token
    if (!userFromDb) {
      const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
      if (!refresh) {
        deleteCookie(c, "auth", cookieOpts);
        deleteCookie(c, "refresh", cookieOpts);
        return c.json(
          {
            success: false,
            message: "Unauthorized: No session found",
            data: null,
          },
          401
        );
      }

      try {
        const decoded = jwt.verify(refresh, REFRESH_SECRET) as {
          uuid: string;
        };

        const tokenRecord = await db
          .select()
          .from(revokedTokens)
          .where(eq(revokedTokens.token, refresh))
          .limit(1);

        // check if refresh token is valid and not revoked
        if (tokenRecord.length === 0 || tokenRecord[0].revoked) {
          // Invalidate and delete cookies if refresh token is invalid or revoked
          deleteCookie(c, "auth", cookieOpts);
          deleteCookie(c, "refresh", cookieOpts);
          return c.json(
            {
              success: false,
              message: "Unauthorized: Invalid or revoked refresh token",
              data: null,
            },
            401
          );
        }

        // Verify the user agent matches the one used at signin
        const userAgent = c.req.header("User-Agent") || "unknown";
        if (userAgent !== tokenRecord[0].userAgent) {
          // If user agent doesn't match, revoke the token to prevent future use
          await db
            .update(revokedTokens)
            .set({ revoked: true })
            .where(eq(revokedTokens.token, refresh));
          deleteCookie(c, "auth", cookieOpts);
          deleteCookie(c, "refresh", cookieOpts);
          return c.json(
            {
              success: false,
              message: "Unauthorized: Session mismatch. Please sign in again.",
              data: null,
            },
            401
          );
        }

        // If refresh token is valid, create a new access token and return the user
        token = jwt.sign({ uuid: decoded.uuid }, JWT_SECRET, {
          expiresIn: "15m",
        });
        setSignedCookie(c, "auth", token, JWT_SECRET, {
          ...cookieOpts,
          maxAge: 15 * 60,
        });

        const rows = await db
          .select()
          .from(user)
          .where(eq(user.uuid, decoded.uuid))
          .limit(1);
        userFromDb = rows[0];

        if (!userFromDb) {
          deleteCookie(c, "auth", cookieOpts);
          deleteCookie(c, "refresh", cookieOpts);
          return c.json(
            {
              success: false,
              message: "Invalid session or user not found",
              data: null,
            },
            401
          );
        }
      } catch (err: any) {
        console.error(err);
        deleteCookie(c, "auth", cookieOpts);
        deleteCookie(c, "refresh", cookieOpts);
        return c.json(
          {
            success: false,
            message: "Unauthorized: Invalid refresh token",
            data: null,
          },
          401
        );
      }
    }

    if (!userFromDb) {
      deleteCookie(c, "auth", cookieOpts);
      deleteCookie(c, "refresh", cookieOpts);
      return c.json(
        {
          success: false,
          message: "Unauthorized: User not found",
          data: null,
        },
        401
      );
    }

    return c.json(
      { success: true, message: "Session active", data: { user: userFromDb } },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, message: "Unauthorized", data: null }, 401);
  }
});

// Active sessions endpoint
sessionHandler.get("/sessions", async (c) => {
  try {
    const token = await getSignedCookie(c, JWT_SECRET, "auth");
    if (!token)
      return c.json(
        { success: false, message: "Unauthorized", data: null },
        401
      );

    const decoded = jwt.verify(token, JWT_SECRET) as { uuid: string };

    const sessions = await db
      .select()
      .from(revokedTokens)
      .where(
        and(
          eq(revokedTokens.revoked, false),
          eq(revokedTokens.uuid, decoded.uuid)
        )
      );

    return c.json(
      {
        success: true,
        message: "Active sessions fetched",
        data: sessions.map((s) => ({
          // Mask the refresh token for security, but allow the unique ID for revocation
          id: s.uuid,
          userAgent: s.userAgent,
          expiresAt: s.expiresAt,
          revoked: s.revoked,
        })),
      },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to fetch sessions", data: null },
      500
    );
  }
});

// Revoke session endpoint
sessionHandler.post("/sessions/revoke", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = revokeSessionSchema.safeParse(body);
    if (!parsed.success)
      return c.json(
        {
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(", "),
          data: null,
        },
        400
      );

    const { token } = parsed.data;
    await db
      .update(revokedTokens)
      .set({ revoked: true })
      .where(eq(revokedTokens.token, token));

    return c.json(
      { success: true, message: "Session revoked successfully", data: null },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to revoke session", data: null },
      500
    );
  }
});

// Signout endpoint
sessionHandler.get("/signout", async (c) => {
  try {
    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");

    // Immediately delete the cookies from the client
    deleteCookie(c, "auth", cookieOpts);
    deleteCookie(c, "refresh", cookieOpts);

    if (refresh) {
      // Find the token record and revoke it in the database
      await db
        .update(revokedTokens)
        .set({ revoked: true })
        .where(eq(revokedTokens.token, refresh));
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

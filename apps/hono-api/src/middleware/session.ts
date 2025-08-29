import type { MiddlewareHandler } from "hono";
import { db } from "../db/index.js";
import { revokedTokens, user } from "../db/auth-schema.js";
import { and, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getSignedCookie, setSignedCookie, deleteCookie } from "hono/cookie";
import { success } from "zod";

const JWT_SECRET = process.env.AUTH_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const NODE_ENV = process.env.NODE_ENV || "development";

const cookieOpts = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "Strict" as const,
  path: "/",
};

export const withAuth: MiddlewareHandler = async (c, next) => {
  let token = await getSignedCookie(c, JWT_SECRET, "auth");
  const userAgent = c.req.header("User-Agent") || "unknown";

  if (!token) {
    // try refresh token
    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
    if (!refresh) {
      await deleteCookie(c, "auth", cookieOpts);
      await deleteCookie(c, "refresh", cookieOpts);
      return c.json(
        {
          error: "Unauthorized",
          data: null,
          success,
          message: "Login to continue",
        },
        401
      );
    }

    try {
      // Check if the refresh token is valid and not revoked in the database
      const tokenRecord = await db
        .select()
        .from(revokedTokens)
        .where(eq(revokedTokens.token, refresh))
        .limit(1);

      if (tokenRecord.length === 0 || tokenRecord[0].revoked) {
        await deleteCookie(c, "auth", cookieOpts);
        await deleteCookie(c, "refresh", cookieOpts);
        return c.json(
          {
            error: "Unauthorized",
            data: null,
            success,
            message: "Login to continue",
          },
          401
        );
      }

      // Security enhancement: Verify the user agent
      if (userAgent !== tokenRecord[0].userAgent) {
        // Revoke the token to prevent future use on a different device
        await db
          .update(revokedTokens)
          .set({ revoked: true })
          .where(eq(revokedTokens.token, refresh));
        await deleteCookie(c, "auth", cookieOpts);
        await deleteCookie(c, "refresh", cookieOpts);
        return c.json(
          {
            error:
              "Unauthorized: Session user agent mismatch. Please sign in again.",
            data: null,
            success: false,
            message:
              "Unauthorized: Session user agent mismatch. Please sign in again.",
          },
          401
        );
      }

      const decodedRefresh = jwt.verify(refresh, REFRESH_SECRET) as {
        userId: string;
      };

      // If the refresh token is valid, issue a new access token
      token = jwt.sign({ userId: decodedRefresh.userId }, JWT_SECRET, {
        expiresIn: "15m",
      });

      await setSignedCookie(c, "auth", token, JWT_SECRET, {
        ...cookieOpts,
        maxAge: 15 * 60,
      });
    } catch (err: any) {
      console.error(err);
      await deleteCookie(c, "auth", cookieOpts);
      await deleteCookie(c, "refresh", cookieOpts);
      return c.json({ error: "Unauthorized" }, 401);
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.uuid, decoded.userId))
      .limit(1);

    const existingUser = rows[0];
    if (!existingUser) {
      await deleteCookie(c, "auth", cookieOpts);
      await deleteCookie(c, "refresh", cookieOpts);
      return c.json(
        {
          error: "Unauthorized",
          data: null,
          success,
          message: "Login to continue",
        },
        401
      );
    }

    c.set("user", existingUser);
    return next();
  } catch (err: any) {
    console.error(err);
    await deleteCookie(c, "auth", cookieOpts);
    await deleteCookie(c, "refresh", cookieOpts);
    return c.json(
      {
        error: "Unauthorized",
        data: null,
        success,
        message: "Login to continue",
      },
      401
    );
  }
};

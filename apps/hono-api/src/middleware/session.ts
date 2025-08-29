import type { MiddlewareHandler } from "hono";
import { db } from "../db/index.js";
import { revokedTokens, user } from "../db/auth-schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getSignedCookie, setSignedCookie } from "hono/cookie";

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

  if (!token) {
    // try refresh token
    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
    if (!refresh) return c.json({ error: "Unauthorized" }, 401);

    try {
      // check blacklist
      const record = await db
        .select()
        .from(revokedTokens)
        .where(eq(revokedTokens.token, refresh))
        .limit(1);

      if (!record[0] || record[0].revoked) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const decodedRefresh = jwt.verify(refresh, REFRESH_SECRET) as {
        userId: string;
      };
      token = jwt.sign({ userId: decodedRefresh.userId }, JWT_SECRET, {
        expiresIn: "15m",
      });

      setSignedCookie(c, "auth", token, JWT_SECRET, {
        ...cookieOpts,
        maxAge: 15 * 60,
      });
    } catch {
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
    if (!existingUser) return c.json({ error: "Unauthorized" }, 401);

    c.set("user", existingUser);
    return next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
};

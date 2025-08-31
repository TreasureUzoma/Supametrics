import type { MiddlewareHandler } from "hono";
import { db } from "../db/index.js";
import { revokedTokens, user } from "../db/auth-schema.js";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getSignedCookie, setSignedCookie } from "hono/cookie";
import { JWT_SECRET, NODE_ENV, REFRESH_SECRET } from "@/handlers/auth.js";
import { unauthorized } from "@/lib/unauthorized.js";

const cookieOpts = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "Strict" as const,
  path: "/",
};

export const withAuth: MiddlewareHandler = async (c, next) => {
  let token = await getSignedCookie(c, JWT_SECRET, "auth");

  if (!token) {
    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
    if (!refresh) return unauthorized(c);

    try {
      // validate refresh token is not revoked
      const [tokenRecord] = await db
        .select()
        .from(revokedTokens)
        .where(eq(revokedTokens.token, refresh))
        .limit(1);

      if (tokenRecord?.revoked) return unauthorized(c);

      const decodedRefresh = jwt.verify(refresh, REFRESH_SECRET) as {
        uuid: string;
      };

      // issue fresh short-lived access token
      token = jwt.sign({ uuid: decodedRefresh.uuid }, JWT_SECRET, {
        expiresIn: "15m",
      });

      await setSignedCookie(c, "auth", token, JWT_SECRET, {
        ...cookieOpts,
        maxAge: 15 * 60,
      });
    } catch (err) {
      console.error(err);
      return unauthorized(c);
    }
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { uuid: string };

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.uuid, decoded.uuid))
      .limit(1);

    if (!existingUser) return unauthorized(c);

    const safeUser = {
      uuid: existingUser.uuid,
      email: existingUser.email,
      name: existingUser.name,
      role: existingUser.role,
      subscriptionType: existingUser.subscriptionType,
    };

    c.set("user", safeUser);
    return next();
  } catch (err) {
    console.error(err);
    return unauthorized(c);
  }
};

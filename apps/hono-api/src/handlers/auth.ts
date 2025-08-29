import { Hono } from "hono";
import { db } from "../db/index.js";
import { revokedTokens, user, verification } from "../db/auth-schema.js";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "@/lib/bcrypt.js";
import type { AuthType } from "../lib/auth.js";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import {
  forgotPasswordSchema,
  revokeSessionSchema,
  signInSchema,
  signUpSchema,
  verifyResetSchema,
} from "@/lib/zod.js";
import { cookieOpts } from "@/helpers/cookie-opts.js";

const authHandler = new Hono<{ Variables: AuthType }>();

const JWT_SECRET = process.env.AUTH_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

if (!JWT_SECRET) throw new Error("AUTH_SECRET not set");

// signup
authHandler.post("/signup", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(", "),
          data: null,
        },
        400
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existing.length > 0)
      return c.json(
        {
          success: false,
          message: "Email already registered",
          data: null,
        },
        400
      );

    const hashed = await hashPassword(password!);
    await db.insert(user).values({ name, email, password: hashed });

    return c.json(
      {
        success: true,
        message: "Account created successfully",
        data: { email },
      },
      201
    );
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to create account", data: null },
      500
    );
  }
});

// signin
authHandler.post("/signin", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        {
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(", "),
          data: null,
        },
        400
      );
    }

    const { email, password } = parsed.data;

    const rows = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    const foundUser = rows[0];
    // Check if user exists and has a password
    if (!foundUser || !foundUser.password) {
      return c.json(
        // Use a generic message for security reasons
        { success: false, message: "Invalid email or password", data: null },
        401
      );
    }

    const valid = await verifyPassword(password!, foundUser.password);
    // Check if password is valid
    if (!valid)
      return c.json(
        // Use a generic message for security reasons
        { success: false, message: "Invalid email or password", data: null },
        401
      );

    // Check if email is verified
    if (!foundUser.emailVerified)
      return c.json(
        { success: false, message: "Email not verified", data: null },
        403
      );

    const accessToken = jwt.sign({ userId: foundUser.uuid }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: foundUser.uuid }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    setSignedCookie(c, "auth", accessToken, JWT_SECRET, {
      ...cookieOpts,
      maxAge: 15 * 60,
    });
    setSignedCookie(c, "refresh", refreshToken, REFRESH_SECRET, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60,
    });

    await db.insert(revokedTokens).values({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent: c.req.header("User-Agent") || "unknown",
    });

    return c.json(
      { success: true, message: "Signed in successfully", data: { email } },
      200
    );
  } catch (err: any) {
    console.error(err);
    // Return a more specific error for unexpected issues
    return c.json(
      {
        success: false,
        message: "An unexpected error occurred during sign-in",
        data: null,
      },
      500
    );
  }
});

// session
authHandler.get("/session", async (c) => {
  try {
    let token = await getSignedCookie(c, JWT_SECRET, "auth");

    if (!token) {
      const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
      if (!refresh)
        return c.json(
          {
            success: false,
            message: "Unauthorized: No session found",
            data: null,
          },
          401
        );

      try {
        const decoded = jwt.verify(refresh, REFRESH_SECRET) as {
          userId: string;
        };
        token = jwt.sign({ userId: decoded.userId }, JWT_SECRET, {
          expiresIn: "15m",
        });

        const tokenRecord = await db
          .select()
          .from(revokedTokens)
          .where(eq(revokedTokens.token, refresh))
          .limit(1);

        if (tokenRecord.length === 0 || tokenRecord[0].revoked) {
          return c.json(
            {
              success: false,
              message: "Unauthorized: Invalid or revoked refresh token",
              data: null,
            },
            401
          );
        }

        setSignedCookie(c, "auth", token, JWT_SECRET, {
          ...cookieOpts,
          maxAge: 15 * 60,
        });
      } catch {
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

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.uuid, decoded.userId))
      .limit(1);
    const existing = rows[0];

    if (!existing)
      return c.json(
        {
          success: false,
          message: "Invalid session or user not found",
          data: null,
        },
        401
      );

    return c.json(
      { success: true, message: "Session active", data: { user: existing } },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, message: "Unauthorized", data: null }, 401);
  }
});

// active sessions
authHandler.get("/sessions", async (c) => {
  try {
    const token = await getSignedCookie(c, JWT_SECRET, "auth");
    if (!token)
      return c.json(
        { success: false, message: "Unauthorized", data: null },
        401
      );

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const sessions = await db
      .select()
      .from(revokedTokens)
      .where(
        and(
          eq(revokedTokens.revoked, false),
          eq(revokedTokens.uuid, decoded.userId)
        )
      );

    return c.json(
      {
        success: true,
        message: "Active sessions fetched",
        data: sessions.map((s) => ({
          token: s.token,
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

// revoke session
authHandler.post("/sessions/revoke", async (c) => {
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

// signout
authHandler.get("/signout", async (c) => {
  try {
    deleteCookie(c, "auth", cookieOpts);
    deleteCookie(c, "refresh", cookieOpts);

    const refresh = await getSignedCookie(c, REFRESH_SECRET, "refresh");
    if (refresh) {
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

// forgot password
authHandler.post("/forgot-password", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success)
      return c.json(
        {
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(", "),
          data: null,
        },
        400
      );

    const { email } = parsed.data;
    const rows = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    const existing = rows[0];

    // Always return a generic success message to prevent email enumeration attacks
    if (!existing)
      return c.json(
        {
          success: true,
          message: "If that email exists, a reset link has been sent to it.",
          data: { email },
        },
        200
      );

    const rawToken = randomUUID();
    const hashedToken = await hashPassword(rawToken);

    // Clean up old tokens for this email
    await db.delete(verification).where(eq(verification.identifier, email));

    await db.insert(verification).values({
      identifier: email,
      value: hashedToken,
      type: "reset_password",
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });

    const link =
      process.env.TRUSTED_ORIGIN + `/reset-password?token=${rawToken}`;

    // TODO: send email with `rawToken` link
    return c.json(
      {
        success: true,
        message: "Reset link sent (stub)",
        data: { email, link },
      },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to send reset link", data: null },
      500
    );
  }
});

// verify reset token
authHandler.post("/verify-reset-token", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = verifyResetSchema.safeParse(body);
    if (!parsed.success)
      return c.json(
        {
          success: false,
          message: parsed.error.issues.map((issue) => issue.message).join(", "),
          data: null,
        },
        400
      );

    const { email, token } = parsed.data;

    const rows = await db
      .select()
      .from(verification)
      .where(
        and(
          eq(verification.identifier, email),
          eq(verification.type, "reset_password")
        )
      )
      .orderBy(verification.expiresAt)
      .limit(1);

    const record = rows[0];
    if (!record)
      return c.json(
        { success: false, message: "Invalid or expired token", data: null },
        400
      );
    if (record.expiresAt < new Date())
      return c.json(
        { success: false, message: "Token expired", data: null },
        400
      );

    const valid = await verifyPassword(token, record.value);
    if (!valid)
      return c.json(
        { success: false, message: "Invalid token", data: null },
        400
      );

    return c.json(
      { success: true, message: "Token valid", data: { email } },
      200
    );
  } catch (err: any) {
    console.error(err);
    return c.json(
      { success: false, message: "Failed to verify token", data: null },
      500
    );
  }
});

// TODO: implement password reset
// TODO: implement oauth

export default authHandler;

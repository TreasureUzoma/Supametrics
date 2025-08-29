import { Hono } from "hono";
import { db } from "../db/index.js";
import { user, verification } from "../db/auth-schema.js";
import { and, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { hashPassword, verifyPassword } from "@/lib/bcrypt.js";
import { setSignedCookie } from "hono/cookie";
import { revokedTokens } from "../db/auth-schema.js";
import {
  forgotPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyResetSchema,
} from "@/lib/zod.js";
import { cookieOpts } from "@/helpers/cookie-opts.js";

const authHandler = new Hono();

const JWT_SECRET = process.env.AUTH_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

if (!JWT_SECRET) throw new Error("AUTH_SECRET not set");
if (!REFRESH_SECRET) throw new Error("REFRESH_SECRET not set");

// Signup endpoint
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
      // Generic message to prevent email enumeration
      return c.json(
        {
          success: false,
          message: "An account with this email already exists.",
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

// Signin endpoint
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
    if (!foundUser || !foundUser.password) {
      // Generic message for security
      return c.json(
        { success: false, message: "Invalid email or password", data: null },
        401
      );
    }

    const valid = await verifyPassword(password!, foundUser.password);
    if (!valid)
      // Generic message for security
      return c.json(
        { success: false, message: "Invalid email or password", data: null },
        401
      );

    // Check if email is verified
    if (!foundUser.emailVerified)
      return c.json(
        { success: false, message: "Email not verified", data: null },
        403
      );

    const accessToken = jwt.sign({ uuid: foundUser.uuid }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ uuid: foundUser.uuid }, REFRESH_SECRET, {
      expiresIn: "7d",
    });

    const userAgent = c.req.header("User-Agent") || "unknown";

    // Store the refresh token and user agent for later validation
    await db.insert(revokedTokens).values({
      uuid: foundUser.uuid,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      userAgent: userAgent,
    });

    setSignedCookie(c, "auth", accessToken, JWT_SECRET, {
      ...cookieOpts,
      maxAge: 15 * 60,
    });
    setSignedCookie(c, "refresh", refreshToken, REFRESH_SECRET, {
      ...cookieOpts,
      maxAge: 7 * 24 * 60 * 60,
    });

    return c.json(
      { success: true, message: "Signed in successfully", data: { email } },
      200
    );
  } catch (err: any) {
    console.error(err);
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

// Forgot password endpoint
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

// Verify reset token endpoint
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

export default authHandler;

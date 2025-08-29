export const AuthErrors = {
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_NOT_VERIFIED: "Email not verified",
  TOKEN_REQUIRED: "Token required",
  UNAUTHORIZED: "Unauthorized access",
  SESSION_INVALID: "Invalid session",
  SESSION_REVOKED: "Session revoked",
  FAILED_SIGNIN: "Unable to sign in at this time",
  FAILED_SIGNUP: "Unable to create account at this time",
  FAILED_PASSWORD_RESET: "Unable to process password reset",
  TOKEN_EXPIRED: "Token expired",
  TOKEN_INVALID: "Invalid token",
} as const;

export type AuthErrorKey = keyof typeof AuthErrors;

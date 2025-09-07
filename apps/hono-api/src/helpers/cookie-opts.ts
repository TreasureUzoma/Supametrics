const NODE_ENV = process.env.NODE_ENV || "development";

export const cookieOpts = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "Strict" as const,
  path: "/",
};

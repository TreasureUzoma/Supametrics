import { cookieOpts } from "@/helpers/cookie-opts.js";
import { deleteCookie } from "hono/cookie";

export const unauthorized = (c: any) => {
  deleteCookie(c, "auth", cookieOpts);
  deleteCookie(c, "refresh", cookieOpts);
  return c.json(
    {
      error: "Unauthorized",
      data: null,
      success: false,
      message: "Login to continue",
    },
    401
  );
};

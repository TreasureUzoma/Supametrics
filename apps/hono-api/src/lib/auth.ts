import type { InferModel } from "drizzle-orm";
import { user } from "../db/auth-schema.js";

export type User = InferModel<typeof user>;

export type Session = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
};

export type AuthType = {
  user: Session["user"];
  session: Omit<Session, "user"> | null;
};

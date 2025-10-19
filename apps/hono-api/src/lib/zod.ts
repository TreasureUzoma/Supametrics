import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(4, "Full name is required").max(255),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const signInSchema = z.object({
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email"),
});

export const verifyResetSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  token: z.string("Invalid token format"),
});

export const revokeSessionSchema = z.object({
  token: z.string().min(1, "Token required"),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string().optional(),
  url: z.url(),
  type: z.literal(["web", "mobile", "backend"]),
});

export const createNewTeamSchema = z.object({
  name: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name must be less than 50 characters"),
  description: z.string().max(200, "Description too long").optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(4).max(100),
  image: z.url().optional(), // deprecated
});

export const isValidUUID = z.uuid("Invalid UUID format");

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

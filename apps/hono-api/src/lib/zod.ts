import { z } from "zod";

export const signUpSchema = z.object({
  fullName: z.string().min(4, "Full name is required").max(255),
});

export const createProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  teamId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  website: z.string(4).optional(88),
});

export const  createNewTeamSchema = z.object({
  name: z
    .string()
    .min(3, "Team name must be at least 3 characters")
    .max(50, "Team name must be less than 50 characters"),
  description: z
    .string()
    .max(200, "Description too long")
    .optional(),
});
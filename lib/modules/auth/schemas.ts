import { z } from "zod";

export const signUpBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
});

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const forgotPasswordBodySchema = z.object({
  email: z.email(),
});

export const updatePasswordBodySchema = z.object({
  password: z.string().min(8),
});

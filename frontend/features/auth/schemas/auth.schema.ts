import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long."),
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    fullName: z.string(),
    tier: z.string(),
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

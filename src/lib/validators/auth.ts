import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caracteres")
  .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir un caractere special");

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8),
  rememberMe: z.boolean().optional().default(false)
});

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas"
  });

export const profileCompletionSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().max(40).optional().or(z.literal("")),
  country: z.string().max(80).optional().or(z.literal("")),
  language: z.enum(["fr", "en"]).default("fr")
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((value) => value.password === value.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas"
  });

export const passwordRules = passwordSchema;

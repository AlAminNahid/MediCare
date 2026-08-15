import { z } from 'zod';

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Email is required')
  .email('Enter a valid email address');

export const nameSchema = z
  .string()
  .trim()
  .min(1, 'Full name is required')
  .min(2, 'Name must be at least 2 characters')
  .regex(/^[a-zA-Z\s.'-]+$/, 'Name can only contain letters and spaces');

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Phone number is required')
  .regex(/^[+\d\s\-()]{7,}$/, 'Enter a valid phone number');

export const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .min(8, 'Password must have at least 8 characters')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[@#$!%*?&\-_]/, 'Password must contain a special character (@ # $ ! % * ? &)');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  phoneNumber: phoneSchema,
  password: passwordSchema,
  role: z.enum(['patient', 'doctor']),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
  newPassword: passwordSchema,
});

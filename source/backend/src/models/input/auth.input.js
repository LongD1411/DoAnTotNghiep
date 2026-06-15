import { z } from 'zod';

export const RegisterSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(6),
  full_name: z.string().min(1).max(30),
  phone:     z.string().max(15).optional(),
});

export const LoginSchema = z.object({
  email:    z.string().min(1),
  password: z.string().min(1),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
});

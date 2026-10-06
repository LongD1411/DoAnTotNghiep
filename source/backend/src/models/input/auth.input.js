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

// PUT /auth/me — sửa hồ sơ cá nhân (chỉ tên + sđt; email/role không đổi qua đây)
export const UpdateProfileSchema = z.object({
  full_name: z.string().min(1).max(30).optional(),
  phone:     z.string().max(15).nullable().optional(),
});

// PUT /auth/me/password — đổi mật khẩu
export const ChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password:     z.string().min(6),
});

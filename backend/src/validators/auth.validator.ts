import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z
  .object({
    name: z.string().min(1, 'Nama wajib diisi').max(100, 'Nama maksimal 100 karakter'),
    email: z
      .string()
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter')
      .transform((v) => v.toLowerCase()),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .max(72, 'Password maksimal 72 karakter'),
    role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Role harus TEACHER atau STUDENT' }) }),
    className: z
      .string()
      .max(100, 'Nama kelas maksimal 100 karakter')
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.role === Role.STUDENT && !data.className) return false;
      return true;
    },
    { message: 'Siswa wajib mengisi nama kelas', path: ['className'] },
  );

export const loginSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .transform((v) => v.toLowerCase()),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

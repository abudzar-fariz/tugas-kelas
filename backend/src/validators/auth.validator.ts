import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nama wajib diisi')
      .max(100, 'Nama maksimal 100 karakter')
      .transform((v) => v.trim()),
    email: z
      .string()
      .email('Format email tidak valid')
      .max(255, 'Email maksimal 255 karakter')
      .transform((v) => v.trim().toLowerCase()),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .max(72, 'Password maksimal 72 karakter (batas bcrypt)'),
    role: z.enum(['TEACHER', 'STUDENT'], {
      errorMap: () => ({ message: 'Role harus TEACHER atau STUDENT' }),
    }),
    className: z
      .string()
      .min(1, 'Nama kelas tidak boleh kosong')
      .max(100, 'Nama kelas maksimal 100 karakter')
      .transform((v) => v.trim())
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'STUDENT' && !data.className) return false;
      return true;
    },
    { message: 'Siswa wajib mengisi nama kelas', path: ['className'] },
  )
  .refine(
    (data) => {
      if (data.role === 'TEACHER' && data.className) return false;
      return true;
    },
    { message: 'Guru tidak perlu mengisi nama kelas', path: ['className'] },
  );

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid')
    .transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password wajib diisi'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

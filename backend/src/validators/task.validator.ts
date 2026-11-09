import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .max(150, 'Judul maksimal 150 karakter')
    .transform((v) => v.trim()),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi')
    .transform((v) => v.trim()),
  dueDate: z
    .string()
    .datetime({ message: 'Format dueDate harus ISO 8601 (contoh: 2027-06-01T00:00:00.000Z)' })
    .transform((v) => new Date(v))
    .refine((d) => d > new Date(), { message: 'Tenggat waktu harus di masa depan' }),
  className: z
    .string()
    .min(1, 'Nama kelas wajib diisi')
    .max(100, 'Nama kelas maksimal 100 karakter')
    .transform((v) => v.trim()),
});

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Judul tidak boleh kosong')
      .max(150, 'Judul maksimal 150 karakter')
      .transform((v) => v.trim())
      .optional(),
    description: z
      .string()
      .min(1, 'Deskripsi tidak boleh kosong')
      .transform((v) => v.trim())
      .optional(),
    dueDate: z
      .string()
      .datetime({ message: 'Format dueDate harus ISO 8601 (contoh: 2027-06-01T00:00:00.000Z)' })
      .transform((v) => new Date(v))
      .refine((d) => d > new Date(), { message: 'Tenggat waktu harus di masa depan' })
      .optional(),
    className: z
      .string()
      .min(1, 'Nama kelas tidak boleh kosong')
      .max(100, 'Nama kelas maksimal 100 karakter')
      .transform((v) => v.trim())
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field harus diisi untuk update',
  });

export const taskQuerySchema = z.object({
  search: z.string().max(100, 'Keyword pencarian maksimal 100 karakter').optional(),
  status: z.enum(['completed', 'pending']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;

import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Judul wajib diisi')
    .max(150, 'Judul maksimal 150 karakter'),
  description: z.string().min(1, 'Deskripsi wajib diisi'),
  dueDate: z
    .string()
    .datetime({ message: 'Format due_date harus ISO 8601' })
    .transform((v) => new Date(v)),
  className: z
    .string()
    .min(1, 'Nama kelas wajib diisi')
    .max(100, 'Nama kelas maksimal 100 karakter'),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['completed', 'pending']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQuery = z.infer<typeof taskQuerySchema>;

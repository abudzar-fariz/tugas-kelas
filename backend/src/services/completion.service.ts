import { PrismaClient } from '@prisma/client';
import { notFound, unprocessable } from '../utils/errors';

const prisma = new PrismaClient();

export async function markComplete(taskId: string, studentId: string, studentClassName: string) {
  // Task must exist
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound('Tugas tidak ditemukan');

  // Student can only complete tasks for their own class
  if (task.className !== studentClassName) {
    throw unprocessable('Tugas ini bukan untuk kelas Anda');
  }

  // Idempotent upsert — safe to call multiple times
  const completion = await prisma.taskCompletion.upsert({
    where: { taskId_studentId: { taskId, studentId } },
    update: {}, // already exists — no-op
    create: { taskId, studentId },
    select: {
      id: true,
      taskId: true,
      studentId: true,
      completedAt: true,
    },
  });

  return completion;
}

export async function unmarkComplete(taskId: string, studentId: string, studentClassName: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound('Tugas tidak ditemukan');

  if (task.className !== studentClassName) {
    throw unprocessable('Tugas ini bukan untuk kelas Anda');
  }

  // Idempotent delete — safe even if completion doesn't exist
  await prisma.taskCompletion.deleteMany({
    where: { taskId, studentId },
  });
}

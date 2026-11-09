import { PrismaClient, Role } from '@prisma/client';
import { forbidden, notFound } from '../utils/errors';
import type { CreateTaskInput, UpdateTaskInput, TaskQuery } from '../validators/task.validator';

const prisma = new PrismaClient();

// Fields returned for every task response — never leaks teacher password
const taskSelect = {
  id: true,
  title: true,
  description: true,
  dueDate: true,
  className: true,
  teacherId: true,
  createdAt: true,
  updatedAt: true,
  teacher: {
    select: { id: true, name: true, email: true },
  },
} as const;

export async function createTask(input: CreateTaskInput, teacherId: string) {
  return prisma.task.create({
    data: {
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      className: input.className,
      teacherId,
    },
    select: taskSelect,
  });
}

export async function getTaskById(taskId: string, requesterId: string, requesterRole: Role) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: taskSelect,
  });

  if (!task) throw notFound('Tugas tidak ditemukan');

  // Teacher can only see their own tasks
  if (requesterRole === Role.TEACHER && task.teacherId !== requesterId) {
    throw notFound('Tugas tidak ditemukan');
  }

  return task;
}

export async function updateTask(
  taskId: string,
  input: UpdateTaskInput,
  teacherId: string,
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound('Tugas tidak ditemukan');
  if (task.teacherId !== teacherId) throw forbidden('Anda bukan pemilik tugas ini');

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate }),
      ...(input.className !== undefined && { className: input.className }),
    },
    select: taskSelect,
  });
}

export async function deleteTask(taskId: string, teacherId: string) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) throw notFound('Tugas tidak ditemukan');
  if (task.teacherId !== teacherId) throw forbidden('Anda bukan pemilik tugas ini');

  await prisma.task.delete({ where: { id: taskId } });
}

export async function listTasks(query: TaskQuery, requesterId: string, requesterRole: Role) {
  const { search, status, page, limit } = query;
  const skip = (page - 1) * limit;

  // Base filter by role
  const roleFilter =
    requesterRole === Role.TEACHER
      ? { teacherId: requesterId }
      : // Student filter handled in commit 6 via className; for now return empty for students
        { id: 'none' };

  const searchFilter = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // status filter requires knowing completions — fully implemented in commit 6
  // Here we list tasks without completion status for teacher view
  const where = { ...roleFilter, ...searchFilter };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        ...taskSelect,
        _count: { select: { taskCompletions: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  // Suppress unused status param warning until commit 6
  void status;

  return {
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

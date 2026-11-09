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

export async function getTaskById(
  taskId: string,
  requesterId: string,
  requesterRole: Role,
  requesterClassName?: string | null,
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: {
      ...taskSelect,
      taskCompletions: {
        where: { studentId: requesterId },
        select: { id: true, completedAt: true },
      },
    },
  });

  if (!task) throw notFound('Tugas tidak ditemukan');

  // Teacher: only see own tasks
  if (requesterRole === Role.TEACHER && task.teacherId !== requesterId) {
    throw notFound('Tugas tidak ditemukan');
  }

  // Student: only see tasks for their class
  if (requesterRole === Role.STUDENT && task.className !== requesterClassName) {
    throw notFound('Tugas tidak ditemukan');
  }

  const { taskCompletions, ...taskData } = task;
  return {
    ...taskData,
    isCompleted: requesterRole === Role.STUDENT ? taskCompletions.length > 0 : undefined,
    completedAt:
      requesterRole === Role.STUDENT && taskCompletions.length > 0
        ? taskCompletions[0]?.completedAt
        : undefined,
  };
}

export async function updateTask(taskId: string, input: UpdateTaskInput, teacherId: string) {
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

export async function listTasks(
  query: TaskQuery,
  requesterId: string,
  requesterRole: Role,
  requesterClassName?: string | null,
) {
  const { search, status, page, limit } = query;
  const skip = (page - 1) * limit;

  // Role-based base filter
  const roleFilter =
    requesterRole === Role.TEACHER
      ? { teacherId: requesterId }
      : { className: requesterClassName ?? '__no_class__' };

  const searchFilter = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  // Status filter for students: join task_completions
  let statusFilter = {};
  if (requesterRole === Role.STUDENT && status === 'completed') {
    statusFilter = {
      taskCompletions: { some: { studentId: requesterId } },
    };
  } else if (requesterRole === Role.STUDENT && status === 'pending') {
    statusFilter = {
      taskCompletions: { none: { studentId: requesterId } },
    };
  }

  const where = { ...roleFilter, ...searchFilter, ...statusFilter };

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      select: {
        ...taskSelect,
        _count: { select: { taskCompletions: true } },
        // For students: include their own completion status
        taskCompletions:
          requesterRole === Role.STUDENT
            ? { where: { studentId: requesterId }, select: { id: true, completedAt: true } }
            : false,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.task.count({ where }),
  ]);

  const data = tasks.map((task) => {
    const { taskCompletions, ...rest } = task as typeof task & {
      taskCompletions?: { id: string; completedAt: Date }[];
    };
    if (requesterRole === Role.STUDENT) {
      return {
        ...rest,
        isCompleted: (taskCompletions ?? []).length > 0,
        completedAt:
          (taskCompletions ?? []).length > 0
            ? (taskCompletions ?? [])[0]?.completedAt
            : undefined,
      };
    }
    return rest;
  });

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

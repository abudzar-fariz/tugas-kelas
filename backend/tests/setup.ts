import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import request from 'supertest';
import app from '../src/app';

// Reuse one PrismaClient across tests
export const prisma = new PrismaClient();

// ── Wipe & seed helpers ───────────────────────────────────────────────────────

export async function clearDatabase() {
  // Delete in FK-safe order
  await prisma.taskCompletion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
}

export interface SeedResult {
  teacher: { id: string; email: string; token: string };
  teacher2: { id: string; email: string; token: string };
  studentA: { id: string; email: string; token: string; className: string };
  studentB: { id: string; email: string; token: string; className: string };
  task10A: { id: string };
  task10B: { id: string };
}

export async function seedTestData(): Promise<SeedResult> {
  await clearDatabase();

  const hash = (pw: string) => bcrypt.hash(pw, 4); // low cost for tests

  const [teacher, teacher2, studentA, studentB] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Guru Test',
        email: 'guru@test.id',
        passwordHash: await hash('password123'),
        role: Role.TEACHER,
        className: null,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Guru Lain',
        email: 'guru2@test.id',
        passwordHash: await hash('password123'),
        role: Role.TEACHER,
        className: null,
      },
    }),
    prisma.user.create({
      data: {
        name: 'Siswa A',
        email: 'siswa.a@test.id',
        passwordHash: await hash('password123'),
        role: Role.STUDENT,
        className: '10-A',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Siswa B',
        email: 'siswa.b@test.id',
        passwordHash: await hash('password123'),
        role: Role.STUDENT,
        className: '10-B',
      },
    }),
  ]);

  const [task10A, task10B] = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Tugas Kelas 10-A',
        description: 'Deskripsi tugas 10-A',
        dueDate: new Date('2027-06-01T00:00:00Z'),
        className: '10-A',
        teacherId: teacher.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Tugas Kelas 10-B',
        description: 'Deskripsi tugas 10-B',
        dueDate: new Date('2027-06-01T00:00:00Z'),
        className: '10-B',
        teacherId: teacher.id,
      },
    }),
  ]);

  // Login semua user untuk mendapatkan token
  const loginUser = async (email: string) => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    return res.body.token as string;
  };

  const [tToken, t2Token, sAToken, sBToken] = await Promise.all([
    loginUser(teacher.email),
    loginUser(teacher2.email),
    loginUser(studentA.email),
    loginUser(studentB.email),
  ]);

  return {
    teacher: { id: teacher.id, email: teacher.email, token: tToken },
    teacher2: { id: teacher2.id, email: teacher2.email, token: t2Token },
    studentA: { id: studentA.id, email: studentA.email, token: sAToken, className: '10-A' },
    studentB: { id: studentB.id, email: studentB.email, token: sBToken, className: '10-B' },
    task10A: { id: task10A.id },
    task10B: { id: task10B.id },
  };
}

// ── Teardown ──────────────────────────────────────────────────────────────────

export async function teardown() {
  await clearDatabase();
  await prisma.$disconnect();
}

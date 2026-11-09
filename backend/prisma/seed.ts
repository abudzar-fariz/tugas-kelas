import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.warn('Seeding database...');

  // Bersihkan data lama (urutan penting: completion -> task -> user)
  await prisma.taskCompletion.deleteMany();
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();

  const BCRYPT_COST = 12;

  // ── Guru ──────────────────────────────────────────────────────────────────
  const teacher = await prisma.user.create({
    data: {
      name: 'Budi Santoso',
      email: 'budi.santoso@sekolah.id',
      passwordHash: await bcrypt.hash('password123', BCRYPT_COST),
      role: Role.TEACHER,
      className: null,
    },
  });

  // ── Siswa (kelas yang sama) ───────────────────────────────────────────────
  const [studentA, studentB] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ani Rahayu',
        email: 'ani.rahayu@siswa.id',
        passwordHash: await bcrypt.hash('password123', BCRYPT_COST),
        role: Role.STUDENT,
        className: '10-A',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Doni Pratama',
        email: 'doni.pratama@siswa.id',
        passwordHash: await bcrypt.hash('password123', BCRYPT_COST),
        role: Role.STUDENT,
        className: '10-A',
      },
    }),
  ]);

  // Siswa dari kelas berbeda (untuk menguji isolasi kelas)
  const studentC = await prisma.user.create({
    data: {
      name: 'Sari Dewi',
      email: 'sari.dewi@siswa.id',
      passwordHash: await bcrypt.hash('password123', BCRYPT_COST),
      role: Role.STUDENT,
      className: '10-B',
    },
  });

  // ── Tugas ─────────────────────────────────────────────────────────────────
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() + n * 86_400_000);

  const [taskMath, taskScience, taskHistory, taskBHistory] = await Promise.all([
    prisma.task.create({
      data: {
        title: 'Latihan Soal Matematika Bab 3',
        description: 'Kerjakan soal halaman 45–50 di buku paket Matematika.',
        dueDate: days(7),
        className: '10-A',
        teacherId: teacher.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Laporan Praktikum IPA',
        description: 'Buat laporan hasil praktikum fotosintesis dengan format yang telah ditentukan.',
        dueDate: days(5),
        className: '10-A',
        teacherId: teacher.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Rangkuman Sejarah Bab 2',
        description: 'Rangkum materi Sejarah Bab 2 tentang masa kolonial minimal 2 halaman.',
        dueDate: days(3),
        className: '10-A',
        teacherId: teacher.id,
      },
    }),
    prisma.task.create({
      data: {
        title: 'Esai Sejarah Lokal',
        description: 'Tulis esai tentang sejarah daerah tempat tinggalmu (min. 500 kata).',
        dueDate: days(10),
        className: '10-B',
        teacherId: teacher.id,
      },
    }),
  ]);

  // ── Completion ────────────────────────────────────────────────────────────
  // Ani sudah menyelesaikan tugas Matematika dan Sejarah
  // Doni sudah menyelesaikan tugas Matematika saja
  // Sari menyelesaikan tugas milik kelasnya (10-B)
  await Promise.all([
    prisma.taskCompletion.create({
      data: { taskId: taskMath.id, studentId: studentA.id },
    }),
    prisma.taskCompletion.create({
      data: { taskId: taskHistory.id, studentId: studentA.id },
    }),
    prisma.taskCompletion.create({
      data: { taskId: taskMath.id, studentId: studentB.id },
    }),
    prisma.taskCompletion.create({
      data: { taskId: taskBHistory.id, studentId: studentC.id },
    }),
  ]);

  console.warn('Seed selesai.');
  console.warn('');
  console.warn('Akun seed:');
  console.warn(`  Guru    : ${teacher.email}  / password123`);
  console.warn(`  Siswa 1 : ${studentA.email} / password123  (kelas 10-A)`);
  console.warn(`  Siswa 2 : ${studentB.email} / password123  (kelas 10-A)`);
  console.warn(`  Siswa 3 : ${studentC.email} / password123  (kelas 10-B)`);
  console.warn('');
  console.warn(`Tugas kelas 10-A: "${taskMath.title}", "${taskScience.title}", "${taskHistory.title}"`);
  console.warn(`Tugas kelas 10-B: "${taskBHistory.title}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

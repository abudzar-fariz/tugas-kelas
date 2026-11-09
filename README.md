# Class Task Tracker

Aplikasi manajemen tugas kelas berbasis web. Guru dapat membuat, mengubah, dan menghapus tugas per kelas. Siswa dapat melihat tugas kelasnya, menandai selesai, serta mencari dan memfilter berdasarkan status.

## Daftar Isi

- [Teknologi](#teknologi)
- [Cara Menjalankan](#cara-menjalankan)
  - [Prasyarat](#prasyarat)
  - [Dengan Docker (Direkomendasikan)](#dengan-docker-direkomendasikan)
  - [Tanpa Docker (Development)](#tanpa-docker-development)
- [Akun Seed](#akun-seed)
- [Endpoint API](#endpoint-api)
- [Desain Sistem](#desain-sistem)
- [Keamanan](#keamanan)
- [Keterbatasan & Pengembangan Lanjutan](#keterbatasan--pengembangan-lanjutan)

---

## Teknologi

| Lapisan | Stack |
|---------|-------|
| Backend | Node.js 22, Express 4, TypeScript 5, Prisma 5, PostgreSQL 16 |
| Frontend | React 18, TypeScript 5, React Router 6, Vite 6 |
| Testing | Vitest 2, Supertest |
| Infrastruktur | Docker, Docker Compose, Nginx |

---

## Cara Menjalankan

### Prasyarat

- Docker Engine ≥ 24 dan Docker Compose v2
- (Opsional, untuk dev tanpa Docker) Node.js 22, npm 10, PostgreSQL 16

### Dengan Docker (Direkomendasikan)

```bash
# 1. Clone repo
git clone <url-repo>
cd tugas-kelas

# 2. Salin file environment
cp .env.example .env
# Edit .env jika perlu — minimal ubah JWT_SECRET

# 3. Build dan jalankan semua service
docker compose up --build

# (opsional) jalankan di background
docker compose up --build -d
```

Service yang berjalan:

| Service | URL |
|---------|-----|
| Web (React) | http://localhost:80 |
| API | http://localhost:3000 |
| PostgreSQL | localhost:5432 |

Migrasi database dijalankan **otomatis** oleh entrypoint saat container `api` pertama kali start.

Untuk mengisi data seed (opsional):

```bash
docker compose exec api npx prisma db seed
```

Untuk menghentikan dan membersihkan:

```bash
# Hentikan container
docker compose down

# Hentikan dan hapus volume database (data hilang)
docker compose down -v
```

---

### Tanpa Docker (Development)

**1. Jalankan PostgreSQL**

```bash
docker compose up -d db
```

**2. Setup backend**

```bash
cd backend
cp ../.env.example .env        # edit DATABASE_URL sesuai setup lokal
npm install
npx prisma migrate dev         # buat tabel
npm run db:seed                # isi data seed
npm run dev                    # server jalan di :3000
```

**3. Setup frontend** (terminal baru)

```bash
cd frontend
npm install
npm run dev                    # dev server jalan di :5173
```

**4. Jalankan test backend**

```bash
cd backend
npm test
```

---

## Akun Seed

| Peran | Email | Password | Kelas |
|-------|-------|----------|-------|
| Guru | `budi.santoso@sekolah.id` | `password123` | — |
| Siswa | `ani.rahayu@siswa.id` | `password123` | 10-A |
| Siswa | `doni.pratama@siswa.id` | `password123` | 10-A |
| Siswa | `sari.dewi@siswa.id` | `password123` | 10-B |

Data tugas seed:

| Judul | Kelas | Tenggat |
|-------|-------|---------|
| Latihan Soal Matematika Bab 3 | 10-A | 7 hari dari seed |
| Laporan Praktikum IPA | 10-A | 5 hari dari seed |
| Rangkuman Sejarah Bab 2 | 10-A | 3 hari dari seed |
| Esai Sejarah Lokal | 10-B | 10 hari dari seed |

---

## Endpoint API

Base URL: `http://localhost:3000/api/v1`

### Auth

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| POST | `/auth/register` | — | Daftar akun guru atau siswa |
| POST | `/auth/login` | — | Login, mendapatkan JWT |
| GET | `/auth/me` | Bearer | Profil pengguna aktif |

**POST `/auth/register`**

```json
{
  "name": "Budi Santoso",
  "email": "budi@sekolah.id",
  "password": "password123",
  "role": "TEACHER"
}
```

Untuk siswa tambahkan `"className": "10-A"`.

**POST `/auth/login`**

```json
{ "email": "budi@sekolah.id", "password": "password123" }
```

Response: `{ "token": "...", "user": { ... } }`

---

### Tugas

Semua endpoint tugas memerlukan header `Authorization: Bearer <token>`.

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| GET | `/tasks` | Semua | Daftar tugas (guru: milik sendiri; siswa: kelas sendiri) |
| GET | `/tasks/:id` | Semua | Detail tugas |
| POST | `/tasks` | TEACHER | Buat tugas baru |
| PATCH | `/tasks/:id` | TEACHER (pemilik) | Ubah tugas |
| DELETE | `/tasks/:id` | TEACHER (pemilik) | Hapus tugas |

**Query params GET `/tasks`**

| Param | Tipe | Default | Keterangan |
|-------|------|---------|------------|
| `search` | string | — | Cari di judul dan deskripsi |
| `status` | `completed` \| `pending` | — | Filter status (siswa saja) |
| `page` | number | 1 | Halaman (min 1) |
| `limit` | number | 10 | Per halaman (max 50) |

**POST `/tasks`**

```json
{
  "title": "Tugas Matematika",
  "description": "Kerjakan soal hal. 45–50",
  "dueDate": "2027-08-01T00:00:00.000Z",
  "className": "10-A"
}
```

---

### Completion Siswa

| Method | Path | Role | Deskripsi |
|--------|------|------|-----------|
| PUT | `/tasks/:id/completion` | STUDENT | Tandai tugas selesai (idempoten) |
| DELETE | `/tasks/:id/completion` | STUDENT | Batalkan penandaan selesai (idempoten) |

---

### Format Error

Semua error dikembalikan dalam format konsisten:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": [
      { "field": "email", "message": "Format email tidak valid" }
    ]
  }
}
```

| HTTP Status | Code | Penyebab Umum |
|-------------|------|---------------|
| 400 | `VALIDATION_ERROR` / `BAD_REQUEST` | Input tidak valid |
| 401 | `UNAUTHORIZED` | Token tidak ada / tidak valid / kredensial salah |
| 403 | `FORBIDDEN` | Role tidak sesuai |
| 404 | `NOT_FOUND` | Data tidak ditemukan |
| 409 | `CONFLICT` | Email sudah digunakan |
| 422 | `UNPROCESSABLE` | Logika bisnis gagal (misal: completion kelas berbeda) |
| 500 | `INTERNAL_SERVER_ERROR` | Kesalahan server |

---

## Desain Sistem

```
┌─────────────┐     HTTP/JSON     ┌──────────────────┐     Prisma     ┌────────────┐
│  React SPA  │ ────────────────▶ │  Express API     │ ─────────────▶ │ PostgreSQL │
│  (Nginx)    │ ◀──────────────── │  (Node.js)       │ ◀───────────── │            │
└─────────────┘                   └──────────────────┘                └────────────┘
      :80                                :3000                             :5432
```

**Model Data**

```
User
├── id (UUID)
├── name, email (unique), passwordHash
├── role: TEACHER | STUDENT
├── className (null untuk guru)
└── tasks[] / taskCompletions[]

Task
├── id (UUID)
├── title, description, dueDate
├── className
├── teacherId → User
└── taskCompletions[]

TaskCompletion
├── id (UUID)
├── taskId → Task
├── studentId → User
├── completedAt
└── UNIQUE(taskId, studentId)
```

**Alur Autentikasi**

1. Client `POST /auth/login` → server verifikasi bcrypt → kembalikan JWT (8 jam)
2. Client simpan token di `sessionStorage`
3. Setiap request berikutnya sertakan `Authorization: Bearer <token>`
4. Middleware `authenticate` verifikasi JWT dan inject `req.user`
5. Middleware `authorizeRole` periksa role sebelum handler dieksekusi

**Isolasi Akses Data**

- Guru hanya melihat/mengubah tugas yang dibuatnya sendiri
- Siswa hanya melihat tugas yang `className`-nya sama dengan `user.className`
- Siswa hanya bisa completion tugas kelas sendiri (422 jika beda kelas)

---

## Keamanan

| Aspek | Implementasi |
|-------|-------------|
| Password | bcrypt cost 12 |
| Token | JWT HS256, expiry 8 jam, disimpan di `sessionStorage` (bukan `localStorage`) |
| Input | Validasi dan sanitasi via Zod (trim whitespace, max length, format check) |
| Response | `passwordHash` tidak pernah dikembalikan ke client |
| Error | Pesan error generik untuk kesalahan 500 (detail disembunyikan) |
| CORS | Hanya origin `FRONTEND_URL` yang diizinkan |

---

## Keterbatasan & Pengembangan Lanjutan

| Keterbatasan Saat Ini | Solusi yang Bisa Ditambahkan |
|-----------------------|------------------------------|
| Tidak ada refresh token | Implementasi refresh token + rotasi |
| Tidak ada rate limiting | Tambahkan `express-rate-limit` di endpoint auth |
| Foto/lampiran tugas belum didukung | Integrasi S3 / object storage |
| Notifikasi tenggat waktu tidak ada | Background job (cron) + email / push notification |
| Belum ada halaman admin | Panel manajemen user untuk admin sekolah |
| Test frontend belum ada | Tambahkan Vitest + React Testing Library / Playwright E2E |
| Tidak ada pagination teacher view | Tambahkan infinite scroll atau pagination di teacher list |

---

## Struktur Direktori

```
tugas-kelas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Model database
│   │   ├── seed.ts             # Data awal
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/        # Handler HTTP
│   │   ├── middleware/         # auth, role, error handler
│   │   ├── routes/             # Express router
│   │   ├── services/           # Logika bisnis
│   │   ├── validators/         # Zod schema
│   │   ├── utils/              # AppError helpers
│   │   ├── types/              # Type augmentation
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   │   ├── setup.ts
│   │   ├── auth.test.ts
│   │   ├── task-auth.test.ts
│   │   ├── completion.test.ts
│   │   └── postman-checklist.md
│   ├── Dockerfile
│   └── docker-entrypoint.sh
├── frontend/
│   ├── src/
│   │   ├── api/                # Fetch wrapper + endpoint functions
│   │   ├── components/         # TaskForm, TaskCard, ConfirmDialog, dll
│   │   ├── hooks/              # useAuth, useTasks, useStudentTasks
│   │   ├── pages/              # LoginPage, RegisterPage, TasksPage
│   │   └── types/              # Shared TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
├── BLUEPRINT.md
└── COMMIT_TIMELINE.md
```

---

## Catatan Pengerjaan

Proyek ini dibuat dengan banyak bantuan AI. Hampir seluruh struktur dan implementasi dihasilkan bersama AI, termasuk:

- Dokumentasi `BLUEPRINT.md` dan `COMMIT_TIMELINE.md`
- Seluruh backend (schema Prisma, services, validators, middleware, routes, tests)
- Seluruh frontend (API client, hooks, komponen, halaman)

Bagian yang saya kerjakan sendiri secara manual:

- `backend/src/middleware/authenticate.ts`
- `backend/src/controllers/auth.controller.ts`
- `backend/Dockerfile`
- `docker-compose.yml`
- `backend/src/app.ts`
- `backend/tests/postman-checklist.md`

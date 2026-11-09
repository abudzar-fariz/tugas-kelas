# Blueprint — Class Task Tracker

## 1. Tujuan

Membangun aplikasi web sederhana untuk manajemen tugas kelas. Guru mengelola tugas dan siswa dapat melihat tugas yang ditujukan kepada kelasnya serta menandainya selesai. Prioritas implementasi adalah otorisasi yang benar, validasi data, respons API konsisten, dan alur antarmuka yang jelas.

## 2. Stack yang dipilih

| Lapisan | Pilihan | Alasan |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript | Cepat dikembangkan, komponen UI dan state mudah dipisahkan. |
| Backend | Node.js + Express + TypeScript | REST API ringkas, validasi serta middleware mudah diuji. |
| ORM | Prisma | Skema, migrasi PostgreSQL, dan seeder terkelola dalam satu tempat. |
| Database | PostgreSQL 16 | Database relasional yang kuat dan mudah dijalankan dengan Docker. |
| Validasi | Zod | Validasi request eksplisit dan pesan error mudah dinormalisasi. |
| Autentikasi | JWT + bcrypt | Password tidak disimpan mentah; API dapat digunakan frontend tanpa session server. |
| Pengujian | Vitest + Supertest + Postman | Feature test endpoint HTTP tanpa browser; Postman untuk verifikasi manual API. |
| Kontainer | Docker + Docker Compose | Menjalankan web, API, dan PostgreSQL secara konsisten. Tidak menggunakan Podman. |

## 3. Struktur direktori target

```text
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   └── tests/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── types/
├── docker-compose.yml
├── .env.example
├── BLUEPRINT.md
└── README.md                 # sengaja dibuat pada commit terakhir
```

## 4. Model data

### `users`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | UUID | primary key |
| name | varchar(100) | wajib |
| email | varchar(255) | unik, dinormalisasi lowercase |
| password_hash | varchar(255) | hasil bcrypt, bukan password asli |
| role | enum | `TEACHER` atau `STUDENT` |
| class_name | varchar(100), nullable | wajib bagi siswa; guru boleh `null` |
| created_at, updated_at | timestamp | audit dasar |

### `tasks`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | UUID | primary key |
| title | varchar(150) | wajib |
| description | text | wajib |
| due_date | timestamp | wajib, ISO 8601 |
| class_name | varchar(100) | kelas tujuan, wajib |
| teacher_id | UUID | FK ke `users.id` |
| created_at, updated_at | timestamp | audit dasar |

### `task_completions`

| Kolom | Tipe | Catatan |
| --- | --- | --- |
| id | UUID | primary key |
| task_id | UUID | FK ke `tasks.id`, hapus ikut tugas |
| student_id | UUID | FK ke `users.id`, hapus ikut siswa |
| completed_at | timestamp | waktu siswa menandai selesai |

Constraint unik `(task_id, student_id)` memastikan satu siswa hanya mempunyai satu status selesai untuk satu tugas.

## 5. Aturan akses

| Aksi | Guru | Siswa |
| --- | --- | --- |
| Registrasi/login | Ya | Ya |
| Melihat tugas | Tugas yang dibuatnya | Hanya tugas untuk `class_name` miliknya |
| Membuat tugas | Ya | Tidak (`403`) |
| Mengubah/menghapus tugas | Hanya tugas miliknya | Tidak (`403`) |
| Menandai selesai | Tidak diperlukan | Hanya tugas kelasnya sendiri |
| Filter status | Status agregat/tidak perlu | Berdasar completion miliknya |

Server selalu mengambil identitas dan peran dari JWT, bukan dari body request. Saat guru mengubah atau menghapus tugas, API memeriksa `teacher_id === authenticatedUser.id`. Saat siswa menandai selesai, API memastikan `task.class_name === authenticatedUser.class_name`.

## 6. Kontrak REST API

Base URL: `/api/v1`.

| Method | Endpoint | Akses | Keterangan |
| --- | --- | --- | --- |
| POST | `/auth/register` | Publik | Daftar akun guru atau siswa |
| POST | `/auth/login` | Publik | Mengembalikan JWT dan profil ringkas |
| GET | `/auth/me` | Login | Profil pengguna saat ini |
| GET | `/tasks` | Login | Pencarian, filter status, dan pagination |
| POST | `/tasks` | Guru | Membuat tugas |
| GET | `/tasks/:id` | Login | Detail tugas bila pengguna berhak melihatnya |
| PATCH | `/tasks/:id` | Pemilik guru | Mengubah tugas |
| DELETE | `/tasks/:id` | Pemilik guru | Menghapus tugas (`204`) |
| PUT | `/tasks/:id/completion` | Siswa | Menandai tugas selesai; idempoten |
| DELETE | `/tasks/:id/completion` | Siswa | Membatalkan selesai; idempoten |

Query untuk `GET /tasks`:

```text
?search=matematika&status=completed|pending&page=1&limit=10
```

Nilai `limit` dibatasi 1–50. Respons daftar selalu memuat metadata:

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

Format error tunggal untuk semua endpoint:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input tidak valid",
    "details": [{ "field": "title", "message": "Judul wajib diisi" }]
  }
}
```

Status HTTP: `400` untuk query/body tidak valid, `401` token tidak ada/tidak valid, `403` aksi dilarang, `404` data tak ditemukan atau tak boleh diakses, `409` email sudah digunakan, `422` aturan bisnis tidak terpenuhi, dan `500` error tak terduga tanpa membocorkan detail internal.

## 7. Validasi dan keamanan

- Password minimal 8 karakter; hash menggunakan bcrypt (cost 12).
- Email divalidasi dan dibuat lowercase sebelum cek unik.
- JWT memiliki masa berlaku singkat (mis. 8 jam), secret hanya dari environment variable.
- Semua endpoint selain auth memakai middleware `authenticate`; middleware `authorizeRole` dipakai untuk aksi guru/siswa.
- Zod memvalidasi seluruh body, path parameter, dan query sebelum controller berjalan.
- ORM digunakan untuk mencegah SQL injection; tidak ada query SQL dengan interpolasi input.
- CORS hanya mengizinkan origin frontend yang didefinisikan `FRONTEND_URL`.
- Response user tidak pernah menyertakan `password_hash`; log tidak mencetak token atau password.
- `.env` masuk `.gitignore`; hanya `.env.example` yang dilacak Git.

## 8. Alur frontend

1. Pengunjung membuka login atau registrasi dan memilih peran.
2. Setelah login, token disimpan di `sessionStorage`; request API menyertakan `Authorization: Bearer <token>`.
3. Guru melihat halaman daftar tugas miliknya dengan tombol tambah, edit, dan hapus; form memakai validasi client dan menampilkan error API.
4. Siswa melihat tugas kelasnya; tiap kartu/baris mempunyai kontrol “Tandai selesai” atau “Batalkan selesai”, tanpa tombol CRUD tugas.
5. Halaman daftar mempunyai input pencarian (debounce), filter status, dan pagination. Perubahan filter mengembalikan halaman ke 1.
6. Setiap request menampilkan loading state, empty state, dan error state yang dapat dicoba kembali. Aksi mutasi menonaktifkan tombol saat sedang dikirim.
7. Tata letak dibuat sederhana dan mudah dipakai; fokus penilaian tetap pada alur dan kejelasan state, bukan fitur responsif sebagai nilai tambah.

## 9. Docker dan environment

`docker-compose.yml` berisi tiga layanan:

| Layanan | Port host | Tanggung jawab |
| --- | --- | --- |
| `db` | 5432 | PostgreSQL dengan named volume `postgres_data` |
| `api` | 3000 | Express API; menjalankan migrasi lalu server |
| `web` | 5173 | Vite frontend (development) atau hasil build yang disajikan server statis |

Backend menerima `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`, dan `FRONTEND_URL`. Frontend menerima `VITE_API_URL`. Seeder membuat setidaknya satu guru, dua siswa dari kelas yang sama, dan beberapa tugas dengan status selesai maupun belum.

Untuk data produksi, password database dan `JWT_SECRET` wajib diganti melalui environment/deployment secret; nilai dalam `.env.example` hanyalah contoh lokal.

## 10. Definition of done

- Semua alur guru dan siswa di atas dapat dijalankan dari browser.
- Tidak ada endpoint mutasi tugas yang dapat dijalankan siswa.
- Pencarian, status, pagination, dan isolasi kelas terbukti berfungsi.
- Minimal tiga endpoint diuji: registrasi/login, larangan siswa membuat tugas, dan completion siswa.
- `docker compose up --build` dapat menyalakan aplikasi dari checkout baru setelah `.env` dibuat dari contoh.
- README menjelaskan cara menjalankan, akun seed, daftar endpoint, keputusan desain, dan batasan; README dibuat pada commit terakhir.

## 11. Nilai tambah yang dipilih (maksimal dua)

1. **Feature test minimal tiga endpoint** memakai Vitest + Supertest. Postman dipakai hanya sebagai alat uji manual saat pengembangan.
2. **Dockerfile dan Docker Compose** untuk menjalankan frontend, API, dan PostgreSQL.

OpenAPI/Swagger, koleksi Postman yang didokumentasikan, notifikasi tenggat, dan responsivitas khusus tidak diklaim sebagai nilai tambah agar tetap memenuhi batas maksimal dua.

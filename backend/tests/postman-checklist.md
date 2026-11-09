# Postman Manual Test Checklist

Checklist ini dijalankan secara manual menggunakan Postman (atau Thunder Client / curl)
terhadap server lokal yang sudah berjalan.

## Prasyarat

1. Database dan server berjalan:
   ```
   docker compose up -d db
   cd backend && npm run db:seed
   npm run dev
   ```
2. Base URL: `http://localhost:3000`
3. Set environment variable `baseUrl = http://localhost:3000/api/v1`

## Akun Seed

| Peran    | Email                      | Password     | Kelas |
|----------|----------------------------|--------------|-------|
| Guru     | budi.santoso@sekolah.id    | password123  | —     |
| Siswa 1  | ani.rahayu@siswa.id        | password123  | 10-A  |
| Siswa 2  | doni.pratama@siswa.id      | password123  | 10-A  |
| Siswa 3  | sari.dewi@siswa.id         | password123  | 10-B  |

---

## 0. Health Check

### 0.1 Server berjalan
- **Method:** `GET`
- **URL:** `http://localhost:3000/health`
- **Header:** *(kosong)*
- **Expected:** `200 OK`, `{ "status": "ok" }`
- [ ] Hasil sesuai

---

## 1. Auth — Register & Login

### 1.1 Register guru baru
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Guru Manual",
    "email": "guru.manual@sekolah.id",
    "password": "password123",
    "role": "TEACHER"
  }
  ```
- **Expected:** `201 Created`, response memuat `token` dan `user.role = "TEACHER"`, tidak ada field `passwordHash`
- [ ] Hasil sesuai

### 1.2 Register guru dengan className diisi — ditolak
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Guru Salah",
    "email": "guru.salah@sekolah.id",
    "password": "password123",
    "role": "TEACHER",
    "className": "10-A"
  }
  ```
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`, `error.details[].field = "className"`
- [ ] Hasil sesuai

### 1.3 Register siswa baru dengan className
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Siswa Manual",
    "email": "siswa.manual@sekolah.id",
    "password": "password123",
    "role": "STUDENT",
    "className": "10-A"
  }
  ```
- **Expected:** `201 Created`, `user.className = "10-A"`
- [ ] Hasil sesuai

### 1.4 Register siswa tanpa className — validasi gagal
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Tanpa Kelas",
    "email": "tanpa.kelas@siswa.id",
    "password": "password123",
    "role": "STUDENT"
  }
  ```
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`, `error.details[].field = "className"`
- [ ] Hasil sesuai

### 1.5 Register password terlalu pendek — validasi gagal
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Short PW",
    "email": "short@test.id",
    "password": "123",
    "role": "TEACHER"
  }
  ```
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`, `error.details[].field = "password"`
- [ ] Hasil sesuai

### 1.6 Register email duplikat
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body:** sama seperti 1.1 (email `guru.manual@sekolah.id`)
- **Expected:** `409 Conflict`, `error.code = "CONFLICT"`
- [ ] Hasil sesuai

### 1.7 Login guru — berhasil
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "budi.santoso@sekolah.id",
    "password": "password123"
  }
  ```
- **Expected:** `200 OK`, simpan `token` sebagai `teacherToken`
- [ ] Hasil sesuai

### 1.8 Login siswa 10-A — berhasil
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "ani.rahayu@siswa.id",
    "password": "password123"
  }
  ```
- **Expected:** `200 OK`, simpan `token` sebagai `studentAToken`
- [ ] Hasil sesuai

### 1.9 Login siswa 10-B — berhasil
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "sari.dewi@siswa.id",
    "password": "password123"
  }
  ```
- **Expected:** `200 OK`, simpan `token` sebagai `studentBToken`
- [ ] Hasil sesuai

### 1.10 Login password salah
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body:**
  ```json
  { "email": "budi.santoso@sekolah.id", "password": "salah123" }
  ```
- **Expected:** `401 Unauthorized`, `error.code = "UNAUTHORIZED"`
- [ ] Hasil sesuai

### 1.11 Login email tidak terdaftar
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body:**
  ```json
  { "email": "tidakada@test.id", "password": "password123" }
  ```
- **Expected:** `401 Unauthorized`, `error.code = "UNAUTHORIZED"`
- [ ] Hasil sesuai

### 1.12 GET /auth/me dengan token valid
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/me`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, `user.email = "budi.santoso@sekolah.id"`, tidak ada `passwordHash`
- [ ] Hasil sesuai

### 1.13 GET /auth/me tanpa token
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/me`
- **Header:** *(kosong)*
- **Expected:** `401 Unauthorized`
- [ ] Hasil sesuai

### 1.14 GET /auth/me dengan token tidak valid
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/me`
- **Header:** `Authorization: Bearer ini.token.palsu`
- **Expected:** `401 Unauthorized`
- [ ] Hasil sesuai

---

## 2. CRUD Tugas — Guru

### 2.1 Guru membuat tugas
- **Method:** `POST`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):**
  ```json
  {
    "title": "Tugas Manual Postman",
    "description": "Tugas yang dibuat saat pengujian manual",
    "dueDate": "2027-08-01T00:00:00.000Z",
    "className": "10-A"
  }
  ```
- **Expected:** `201 Created`, simpan `data.id` sebagai `taskId`
- [ ] Hasil sesuai

### 2.2 Guru membuat tugas dengan dueDate di masa lalu — ditolak
- **Method:** `POST`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):**
  ```json
  {
    "title": "Tugas Lampau",
    "description": "Tenggat sudah lewat",
    "dueDate": "2020-01-01T00:00:00.000Z",
    "className": "10-A"
  }
  ```
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`, pesan mengandung "masa depan"
- [ ] Hasil sesuai

### 2.3 Guru membuat tugas dengan field kurang — validasi gagal
- **Method:** `POST`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):** `{ "title": "Tidak Lengkap" }`
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`
- [ ] Hasil sesuai

### 2.4 Guru melihat daftar tugas miliknya
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, semua item `teacherId` milik guru tersebut, ada `meta.total`
- [ ] Hasil sesuai

### 2.5 Guru melihat detail tugas miliknya
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, `data.id = taskId`
- [ ] Hasil sesuai

### 2.6 Guru mengubah judul tugas
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):** `{ "title": "Tugas Manual Diperbarui" }`
- **Expected:** `200 OK`, `data.title = "Tugas Manual Diperbarui"`
- [ ] Hasil sesuai

### 2.7 PATCH dengan body kosong — ditolak
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):** `{}`
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`, pesan mengandung "minimal satu field"
- [ ] Hasil sesuai

### 2.8 PATCH dengan dueDate di masa lalu — ditolak
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):** `{ "dueDate": "2020-01-01T00:00:00.000Z" }`
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`
- [ ] Hasil sesuai

### 2.9 Guru lain mencoba PATCH tugas — ditolak
- Login sebagai `guru.manual@sekolah.id` (dari 1.1), simpan token sebagai `otherTeacherToken`
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{otherTeacherToken}}`
- **Body (JSON):** `{ "title": "Dicuri" }`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.10 Siswa mencoba membuat tugas — ditolak
- **Method:** `POST`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Body:** sama seperti 2.1
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.11 Siswa mencoba PATCH tugas — ditolak
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Body:** `{ "title": "Siswa Coba Ubah" }`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.12 Siswa mencoba DELETE tugas — ditolak
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

---

## 3. Pencarian, Filter, dan Pagination

### 3.1 Siswa melihat daftar tugas kelasnya
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua item `className = "10-A"`, ada field `isCompleted` (boolean), ada `meta.total`
- [ ] Hasil sesuai

### 3.2 Siswa 10-B tidak melihat tugas 10-A
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{studentBToken}}`
- **Expected:** `200 OK`, semua item `className = "10-B"` (tidak ada yang `10-A`)
- [ ] Hasil sesuai

### 3.3 Siswa 10-A tidak bisa akses detail task 10-B
- Ambil `taskId` dari tugas kelas 10-B (GET /tasks dengan studentBToken)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks/{{task10BId}}`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `404 Not Found`
- [ ] Hasil sesuai

### 3.4 Pencarian dengan keyword
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?search=matematika`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua hasil title/description mengandung kata "matematika" (case-insensitive)
- [ ] Hasil sesuai

### 3.5 Filter status=pending
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=pending`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua item `isCompleted = false`
- [ ] Hasil sesuai

### 3.6 Filter status=completed
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=completed`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua item `isCompleted = true`
- [ ] Hasil sesuai

### 3.7 Filter status pada guru — tidak berpengaruh
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=completed`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, daftar tugas guru tetap ditampilkan (filter status diabaikan untuk guru)
- [ ] Hasil sesuai

### 3.8 Pagination limit=2
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?page=1&limit=2`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, `data.length <= 2`, `meta.limit = 2`, `meta.page = 1`, `meta.totalPages` ada
- [ ] Hasil sesuai

### 3.9 Limit melebihi batas maksimal (50) — ditolak
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?limit=100`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `400 Bad Request`, `error.code = "VALIDATION_ERROR"`
- [ ] Hasil sesuai

---

## 4. Completion Siswa

### 4.1 Siswa menandai tugas selesai
- Gunakan salah satu `taskId` tugas kelas 10-A (dari GET /tasks dengan studentAToken)
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, `data.completedAt` ada, `data.taskId` = taskId
- [ ] Hasil sesuai

### 4.2 PUT completion idempoten (panggil dua kali)
- Ulangi request 4.1 persis sama
- **Expected:** `200 OK` (tidak error, tidak duplikat)
- [ ] Hasil sesuai

### 4.3 Filter status=completed setelah menandai
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=completed`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua item `isCompleted = true`, termasuk task yang baru ditandai
- [ ] Hasil sesuai

### 4.4 Siswa kelas berbeda mencoba completion tugas kelas lain — ditolak
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion` *(taskId dari kelas 10-A)*
- **Header:** `Authorization: Bearer {{studentBToken}}`
- **Expected:** `422 Unprocessable`, `error.code = "UNPROCESSABLE"`
- [ ] Hasil sesuai

### 4.5 Guru mencoba completion — ditolak
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 4.6 Completion task yang tidak ada — 404
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/00000000-0000-0000-0000-000000000000/completion`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `404 Not Found`
- [ ] Hasil sesuai

### 4.7 Siswa membatalkan completion
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `204 No Content`
- [ ] Hasil sesuai

### 4.8 DELETE completion idempoten (panggil dua kali)
- Ulangi request 4.7
- **Expected:** `204 No Content` (tidak error)
- [ ] Hasil sesuai

### 4.9 Setelah dibatalkan, task kembali pending
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=completed`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** Task yang dibatalkan tidak muncul di list completed
- [ ] Hasil sesuai

### 4.10 Guru mencoba DELETE completion — ditolak
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

---

## 5. Akses Terlarang — Edge Cases

### 5.1 Akses endpoint tanpa token
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** *(kosong)*
- **Expected:** `401 Unauthorized`
- [ ] Hasil sesuai

### 5.2 Token tidak valid / expired
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer ini.token.palsu`
- **Expected:** `401 Unauthorized`
- [ ] Hasil sesuai

### 5.3 Task ID tidak ditemukan (guru)
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks/00000000-0000-0000-0000-000000000000`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `404 Not Found`, `error.code = "NOT_FOUND"`
- [ ] Hasil sesuai

### 5.4 Guru menghapus tugas miliknya
- Gunakan `taskId` dari 2.1
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `204 No Content`
- [ ] Hasil sesuai

### 5.5 GET task setelah dihapus
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `404 Not Found`
- [ ] Hasil sesuai

### 5.6 Guru lain mencoba DELETE tugas — ditolak
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{otherTeacherToken}}`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

---

## Catatan Hasil

| No   | Nama Test                                              | Status |
|------|--------------------------------------------------------|--------|
| 0.1  | Server health check                                    |        |
| 1.1  | Register guru baru                                     |        |
| 1.2  | Register guru dengan className — ditolak               |        |
| 1.3  | Register siswa dengan className                        |        |
| 1.4  | Register siswa tanpa className — ditolak               |        |
| 1.5  | Register password pendek — ditolak                     |        |
| 1.6  | Register email duplikat                                |        |
| 1.7  | Login guru berhasil                                    |        |
| 1.8  | Login siswa 10-A berhasil                              |        |
| 1.9  | Login siswa 10-B berhasil                              |        |
| 1.10 | Login password salah                                   |        |
| 1.11 | Login email tidak terdaftar                            |        |
| 1.12 | GET /me dengan token                                   |        |
| 1.13 | GET /me tanpa token                                    |        |
| 1.14 | GET /me token tidak valid                              |        |
| 2.1  | Guru membuat tugas                                     |        |
| 2.2  | Guru buat tugas dueDate lampau — ditolak               |        |
| 2.3  | Guru buat tugas field kurang — ditolak                 |        |
| 2.4  | Guru lihat daftar tugasnya                             |        |
| 2.5  | Guru lihat detail tugas                                |        |
| 2.6  | Guru mengubah tugas                                    |        |
| 2.7  | PATCH body kosong — ditolak                            |        |
| 2.8  | PATCH dueDate lampau — ditolak                         |        |
| 2.9  | Guru lain PATCH — ditolak                              |        |
| 2.10 | Siswa create tugas — ditolak                           |        |
| 2.11 | Siswa PATCH tugas — ditolak                            |        |
| 2.12 | Siswa DELETE tugas — ditolak                           |        |
| 3.1  | Siswa lihat tugas kelasnya                             |        |
| 3.2  | Siswa 10-B tidak lihat tugas 10-A                      |        |
| 3.3  | Siswa 10-A akses detail task 10-B — 404                |        |
| 3.4  | Search keyword                                         |        |
| 3.5  | Filter status=pending                                  |        |
| 3.6  | Filter status=completed                                |        |
| 3.7  | Filter status guru — tidak berpengaruh                 |        |
| 3.8  | Pagination limit=2                                     |        |
| 3.9  | Limit > 50 — ditolak                                   |        |
| 4.1  | Siswa tandai selesai                                   |        |
| 4.2  | PUT completion idempoten                               |        |
| 4.3  | Filter completed setelah tandai                        |        |
| 4.4  | Siswa kelas beda completion kelas lain — ditolak       |        |
| 4.5  | Guru PUT completion — ditolak                          |        |
| 4.6  | Completion task tidak ada — 404                        |        |
| 4.7  | Siswa batalkan completion                              |        |
| 4.8  | DELETE completion idempoten                            |        |
| 4.9  | Task kembali pending setelah dibatalkan                |        |
| 4.10 | Guru DELETE completion — ditolak                       |        |
| 5.1  | Tanpa token                                            |        |
| 5.2  | Token tidak valid                                      |        |
| 5.3  | Task ID tidak ditemukan (guru)                         |        |
| 5.4  | Guru hapus tugas miliknya                              |        |
| 5.5  | GET task setelah dihapus                               |        |
| 5.6  | Guru lain DELETE tugas — ditolak                       |        |

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
2. Base URL: `http://localhost:3000/api/v1`
3. Set environment variable `baseUrl = http://localhost:3000/api/v1`

## Akun Seed

| Peran    | Email                      | Password     | Kelas |
|----------|----------------------------|--------------|-------|
| Guru     | budi.santoso@sekolah.id    | password123  | —     |
| Siswa 1  | ani.rahayu@siswa.id        | password123  | 10-A  |
| Siswa 2  | doni.pratama@siswa.id      | password123  | 10-A  |
| Siswa 3  | sari.dewi@siswa.id         | password123  | 10-B  |

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

### 1.2 Register siswa baru dengan className
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

### 1.3 Register siswa tanpa className (validasi gagal)
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

### 1.4 Register email duplikat
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body:** sama seperti 1.1 (email `guru.manual@sekolah.id`)
- **Expected:** `409 Conflict`, `error.code = "CONFLICT"`
- [ ] Hasil sesuai

### 1.5 Login guru — berhasil
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

### 1.6 Login siswa 10-A — berhasil
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

### 1.7 Login siswa 10-B — berhasil
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

### 1.8 Login password salah
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body:**
  ```json
  { "email": "budi.santoso@sekolah.id", "password": "salah123" }
  ```
- **Expected:** `401 Unauthorized`, `error.code = "UNAUTHORIZED"`
- [ ] Hasil sesuai

### 1.9 GET /auth/me dengan token valid
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/me`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, `user.email = "budi.santoso@sekolah.id"`, tidak ada `passwordHash`
- [ ] Hasil sesuai

### 1.10 GET /auth/me tanpa token
- **Method:** `GET`
- **URL:** `{{baseUrl}}/auth/me`
- **Header:** *(kosong)*
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

### 2.2 Guru melihat detail tugas miliknya
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `200 OK`, `data.id = taskId`
- [ ] Hasil sesuai

### 2.3 Guru mengubah judul tugas
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Body (JSON):**
  ```json
  { "title": "Tugas Manual Diperbarui" }
  ```
- **Expected:** `200 OK`, `data.title = "Tugas Manual Diperbarui"`
- [ ] Hasil sesuai

### 2.4 Guru lain mencoba PATCH tugas — ditolak
- Login sebagai `guru.manual@sekolah.id` (dari 1.1), simpan token sebagai `otherTeacherToken`
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{otherTeacherToken}}`
- **Body (JSON):** `{ "title": "Dicuri" }`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.5 Siswa mencoba membuat tugas — ditolak
- **Method:** `POST`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Body:** sama seperti 2.1
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.6 Siswa mencoba PATCH tugas — ditolak
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Body:** `{ "title": "Siswa Coba Ubah" }`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 2.7 Siswa mencoba DELETE tugas — ditolak
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
- **Expected:** `200 OK`, semua item `className = "10-A"`, ada field `isCompleted`, ada `meta.total`
- [ ] Hasil sesuai

### 3.2 Siswa 10-B tidak melihat tugas 10-A
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks`
- **Header:** `Authorization: Bearer {{studentBToken}}`
- **Expected:** `200 OK`, semua item `className = "10-B"` (tidak ada yang `10-A`)
- [ ] Hasil sesuai

### 3.3 Pencarian dengan keyword
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?search=matematika`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua hasil title/description mengandung kata "matematika" (case-insensitive)
- [ ] Hasil sesuai

### 3.4 Filter status=pending
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=pending`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, semua item `isCompleted = false`
- [ ] Hasil sesuai

### 3.5 Pagination limit=2
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?page=1&limit=2`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `200 OK`, `data.length <= 2`, `meta.limit = 2`, `meta.page = 1`, `meta.totalPages` ada
- [ ] Hasil sesuai

### 3.6 Limit melebihi batas maksimal (50)
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
- **Expected:** `200 OK`, `data.completedAt` ada
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

### 4.4 Siswa kelas berbeda mencoba completion tugas kelas lain
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`  *(taskId dari kelas 10-A)*
- **Header:** `Authorization: Bearer {{studentBToken}}`
- **Expected:** `422 Unprocessable`, `error.code = "UNPROCESSABLE"`
- [ ] Hasil sesuai

### 4.5 Guru mencoba completion — ditolak
- **Method:** `PUT`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{teacherToken}}`
- **Expected:** `403 Forbidden`
- [ ] Hasil sesuai

### 4.6 Siswa membatalkan completion
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/tasks/{{taskId}}/completion`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** `204 No Content`
- [ ] Hasil sesuai

### 4.7 DELETE completion idempoten (panggil dua kali)
- Ulangi request 4.6
- **Expected:** `204 No Content` (tidak error)
- [ ] Hasil sesuai

### 4.8 Setelah dibatalkan, task kembali pending
- **Method:** `GET`
- **URL:** `{{baseUrl}}/tasks?status=completed`
- **Header:** `Authorization: Bearer {{studentAToken}}`
- **Expected:** Task yang dibatalkan tidak muncul di list completed
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

### 5.3 Task ID tidak ditemukan
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

---

## Catatan Hasil

| No  | Nama Test                                         | Status |
|-----|---------------------------------------------------|--------|
| 1.1 | Register guru baru                                |        |
| 1.2 | Register siswa dengan className                   |        |
| 1.3 | Register siswa tanpa className                    |        |
| 1.4 | Register email duplikat                           |        |
| 1.5 | Login guru berhasil                               |        |
| 1.6 | Login siswa 10-A berhasil                         |        |
| 1.7 | Login siswa 10-B berhasil                         |        |
| 1.8 | Login password salah                              |        |
| 1.9 | GET /me dengan token                              |        |
| 1.10| GET /me tanpa token                               |        |
| 2.1 | Guru membuat tugas                                |        |
| 2.2 | Guru melihat detail tugas                         |        |
| 2.3 | Guru mengubah tugas                               |        |
| 2.4 | Guru lain PATCH — ditolak                         |        |
| 2.5 | Siswa create tugas — ditolak                      |        |
| 2.6 | Siswa PATCH tugas — ditolak                       |        |
| 2.7 | Siswa DELETE tugas — ditolak                      |        |
| 3.1 | Siswa lihat tugas kelasnya                        |        |
| 3.2 | Siswa 10-B tidak lihat tugas 10-A                 |        |
| 3.3 | Search keyword                                    |        |
| 3.4 | Filter status=pending                             |        |
| 3.5 | Pagination limit=2                                |        |
| 3.6 | Limit > 50 ditolak                                |        |
| 4.1 | Siswa tandai selesai                              |        |
| 4.2 | PUT completion idempoten                          |        |
| 4.3 | Filter status=completed setelah tandai            |        |
| 4.4 | Siswa kelas beda completion kelas lain — ditolak  |        |
| 4.5 | Guru completion — ditolak                         |        |
| 4.6 | Siswa batalkan completion                         |        |
| 4.7 | DELETE completion idempoten                       |        |
| 4.8 | Task kembali pending setelah dibatalkan           |        |
| 5.1 | Tanpa token                                       |        |
| 5.2 | Token tidak valid                                 |        |
| 5.3 | Task ID tidak ditemukan                           |        |
| 5.4 | Guru hapus tugas miliknya                         |        |
| 5.5 | GET task setelah dihapus                          |        |

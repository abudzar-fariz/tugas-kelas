# Timeline Commit — Class Task Tracker

Rencana ini sengaja memecah pekerjaan menjadi perubahan kecil yang dapat ditinjau dan diuji. Jalankan `git status`, test terkait, lalu commit segera setelah tiap tahap selesai. Jangan memasukkan `.env`, token, atau password asli ke commit mana pun.

| Urutan | Pesan commit yang disarankan | Isi perubahan | Verifikasi sebelum commit |
| --- | --- | --- | --- |
| 1 | `chore: initialize class task tracker workspace` | Inisialisasi monorepo `frontend` dan `backend`, `.gitignore`, konfigurasi TypeScript/lint/format, `.env.example`. | Build kosong backend dan frontend berhasil; `.env` terabaikan Git. |
| 2 | `docs: add project blueprint and commit timeline` | Tambahkan `BLUEPRINT.md` dan `COMMIT_TIMELINE.md`. | Tinjau bahwa arsitektur, akses, dan rencana Docker sudah sesuai tugas. |
| 3 | `feat(api): add database schema and seed data` | Prisma schema, migrasi awal, seeder guru/siswa/tugas/completion, skrip migrate/seed. | Database baru dapat dimigrasi dan seed tanpa error. |
| 4 | `feat(api): add authentication and role middleware` | Registrasi, login, hash bcrypt, JWT, `/auth/me`, middleware autentikasi/otorisasi, error handler standar. | Login benar berhasil; password salah `401`; email duplikat `409`. |
| 5 | `feat(api): add teacher task management endpoints` | Validasi Zod dan endpoint buat, detail, ubah, hapus tugas; pemeriksaan pemilik tugas. | Guru pemilik dapat CRUD; guru lain menerima `404`/`403` sesuai kontrak. |
| 6 | `feat(api): add student task listing and completion` | Daftar tugas berdasarkan kelas, search, filter completion, pagination, endpoint completion idempoten. | Siswa hanya melihat tugas kelasnya dan tidak dapat membuat/mengubah/menghapus tugas. |
| 7 | `test(api): cover auth authorization and completion flows` | Minimal tiga feature test: auth, larangan CRUD siswa, completion siswa; tambah test validasi bila perlu. | `npm test` backend hijau. |
| 8 | `test(api): add Postman manual test checklist` | Tambahkan checklist request Postman lokal untuk login, CRUD guru, akses terlarang siswa, pencarian/filter, dan completion. Ini bukan nilai tambah dokumentasi API terpisah. | Jalankan checklist dengan data seed dan catat hasil yang diharapkan. |
| 9 | `feat(web): add authentication screens and session handling` | Halaman registrasi/login, API client, penyimpanan token, route protection, loading/error state. | Login peran guru dan siswa mengarah ke halaman tugas yang tepat. |
| 10 | `feat(web): add teacher task management interface` | Daftar guru, form tambah/edit, konfirmasi hapus, validasi, state loading/error/empty. | Guru dapat menyelesaikan CRUD penuh lewat UI. |
| 11 | `feat(web): add student task tracking interface` | Daftar siswa, search/filter/pagination, tombol completion, serta state kosong/loading/error. | Siswa dapat mencari, memfilter, pindah halaman, dan mengubah status selesai. |
| 12 | `build: add Docker Compose development environment` | Dockerfile API/web, `docker-compose.yml`, healthcheck database, named volume, perintah startup migrasi/seeder bila diperlukan. | Dari checkout bersih: salin `.env.example`, lalu `docker compose up --build` dan akses web/API. |
| 13 | `fix: harden validation and polish user states` | Perbaikan hasil pengujian manual: validasi, pesan error, empty/loading state, dan batas akses. | Uji manual seluruh acceptance criteria. |
| 14 | `docs: add setup and API README` | **Commit terakhir.** Tulis README berisi cara menjalankan dari nol dengan Docker, akun seed, endpoint, desain, keamanan, serta keterbatasan/lanjutan. | Ikuti README dari kondisi checkout baru dan pastikan tidak ada rahasia tersimpan. |

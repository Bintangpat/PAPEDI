Berikut adalah **PRD (Product Requirements Document)** khusus untuk **Fitur Dashboard Role Student** dengan base route:

`/student/dashboard`

Mengacu pada schema database:

- users
- courses
- enrollments
- modules
- lessons
- quizzes
- quiz_attempts
- project_submissions
- certificates

---

# PRODUCT REQUIREMENTS DOCUMENT

## Student Dashboard

Route: `/student/dashboard`

---

# 1. Tujuan Fitur

Menyediakan pusat kontrol utama bagi student untuk:

- Melihat progres pembelajaran
- Mengakses pelatihan aktif
- Memantau quiz & project
- Melihat sertifikat
- Mendapatkan rekomendasi pelatihan

Dashboard harus menjadi ringkasan visual seluruh aktivitas belajar.

---

# 2. User Role

Akses hanya untuk:

- role = "student"

Middleware:

- Auth required
- Role validation required

Jika bukan student → redirect `/403`

---

# 3. Struktur Halaman

Route utama:
`/student/dashboard`

Subroute tambahan:

- `/student/dashboard/analytics`
- `/student/dashboard/activity`
- `/student/dashboard/certificates`

---

# 4. Komponen Utama Dashboard

---

## 4.1 Welcome Section

Menampilkan:

- Nama user
- Progress summary
- Jumlah course aktif
- Jumlah course selesai

Data source:

- users
- enrollments

---

## 4.2 Statistik Ringkasan

Menampilkan kartu statistik:

1. Total Course Diikuti
   → count enrollments

2. Course Selesai
   → enrollments.status = completed

3. Quiz Rata-rata
   → AVG(score) dari quiz_attempts

4. Project Disetujui
   → project_submissions.status = approved

---

## 4.3 Progress Overview

Menampilkan:

- Persentase progres tiap course
- Progress bar visual

Data dihitung dari:

- modules dalam course
- lesson completion
- quiz_attempts
- project_submissions

Rumus dasar progres:
completed modules / total modules × 100%

---

## 4.4 Course Aktif

Menampilkan maksimal 3 course terbaru:

Informasi:

- Judul course
- Progress %
- Last activity
- Tombol "Lanjutkan"

Route tombol:
`/student/my-courses/:courseId`

Data:

- enrollments
- courses

---

## 4.5 Aktivitas Terbaru

Menampilkan:

- Quiz terakhir dikerjakan
- Project terakhir disubmit
- Course baru di-enroll

Data:

- quiz_attempts
- project_submissions
- enrollments

Subroute detail:
`/student/dashboard/activity`

---

## 4.6 Sertifikat Terbaru

Menampilkan:

- Sertifikat terbaru
- Download button

Data:

- certificates

Subroute:
`/student/dashboard/certificates`

---

## 4.7 Rekomendasi Pelatihan

Menampilkan:

- Course yang belum di-enroll
- Berdasarkan kategori course sebelumnya

Data:

- courses
- enrollments

Route:
`/student/courses/:courseId`

---

# 5. Subroute Detail

---

## 5.1 Analytics Detail

Route:
`/student/dashboard/analytics`

Menampilkan:

- Grafik progres belajar
- Grafik nilai quiz
- Statistik completion rate

Data:

- quiz_attempts
- enrollments
- project_submissions

---

## 5.2 Activity Detail

Route:
`/student/dashboard/activity`

Menampilkan tabel aktivitas:

Kolom:

- Tanggal
- Jenis aktivitas
- Course
- Status

---

## 5.3 Certificates Detail

Route:
`/student/dashboard/certificates`

Menampilkan:

- List semua sertifikat
- Nomor sertifikat
- Tanggal terbit
- Status validasi

---

# 6. API Requirements

Endpoint backend:

GET `/api/student/dashboard/summary`
GET `/api/student/dashboard/progress`
GET `/api/student/dashboard/activity`
GET `/api/student/dashboard/certificates`
GET `/api/student/dashboard/recommendations`

Semua endpoint:

- Memerlukan access token
- Validasi role student

---

# 7. UX/UI Requirements (shadcn)

---

## 7.1 Layout

Gunakan:

- Card untuk statistik
- Progress untuk progress bar
- Table untuk aktivitas
- Badge untuk status
- Tabs untuk sub-section

---

## 7.2 Error Handling

Jika data kosong:

- Tampilkan empty state dengan pesan informatif

Jika error server:

- Alert merah global
- Retry button

---

## 7.3 Loading State

Gunakan:

- Skeleton loading
- Spinner di dalam Card

---

## 7.4 Responsiveness

- Grid responsive
- 1 kolom di mobile
- 2–4 kolom di desktop

---

# 8. Non-Functional Requirements

Performance:

- Response < 500ms
- Query teroptimasi dengan index

Security:

- Tidak boleh ambil data student lain
- Query selalu filter by userId

Scalability:

- Aggregation query harus efisien
- Gunakan pagination untuk activity

---

# 9. Data Query Logic (High-Level)

---

## Summary Query

- COUNT enrollments WHERE userId
- AVG quiz_attempts.score WHERE userId
- COUNT project_submissions approved WHERE userId

---

## Progress Calculation

- Hitung total module dalam course
- Hitung module selesai (quiz lulus + project approved)

---

# 10. KPI Keberhasilan Dashboard

- Student login ≥ 3x per minggu
- Completion rate meningkat
- Bounce rate rendah
- Project submission meningkat

---

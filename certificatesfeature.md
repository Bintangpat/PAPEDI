Saya akan membuat **2 PRD terpisah dan terstruktur**, lalu di bagian akhir saya beri analisis perubahan skema database yang diperlukan (berdasarkan schema Prisma yang kamu kirim).

Saya fokus pada:

- Requirement fungsional
- Logic kelulusan
- Alur sistem
- Dampak ke database

---

# PRD 1 — FITUR SERTIFIKASI

## 1. Overview

Fitur sertifikasi memungkinkan:

- Admin mengelola template sertifikat
- Sistem otomatis menentukan kelayakan
- Student dapat meng-generate sertifikat jika memenuhi syarat kelulusan

Syarat kelulusan:

1. Semua lesson pada course selesai dibaca
2. Semua quiz telah dikerjakan
3. Semua quiz minimal skor 80%
4. Project akhir disubmit dan dinyatakan LULUS
5. Course berstatus completed

---

## 2. Tujuan Bisnis

- Meningkatkan completion rate
- Memberikan value konkret ke student
- Menjadi aset portfolio student
- Meningkatkan kredibilitas platform

---

## 3. Actor

- Admin
- Student
- Mentor (review project)

---

## 4. User Flow

### Student Flow

1. Student menyelesaikan seluruh module
2. Sistem validasi:
   - Semua lesson ID ada di completedLessons
   - Semua quiz memiliki attempt dengan passed = true
   - ProjectSubmission.status = LULUS

3. Jika valid:
   - Tombol “Generate Certificate” aktif

4. Student klik generate
5. Sistem:
   - Membuat record Certificate
   - Generate serialNumber unik
   - Generate PDF

6. Sertifikat dapat diunduh

---

## 5. Functional Requirements

### 5.1 Validasi Kelulusan

System harus:

- Mengecek Enrollment
- Mengecek semua module dalam course
- Mengecek QuizAttempt tertinggi >= 80
- Mengecek ProjectSubmission.status = LULUS

Jika salah satu tidak terpenuhi:

- Tombol disabled
- Tampilkan requirement yang belum terpenuhi

---

### 5.2 Certificate Management (Admin)

Admin dapat:

- Upload / edit template desain
- Mengatur:
  - Nama pelatihan
  - Deskripsi
  - Logo
  - Signature

- Melihat daftar sertifikat yang telah diterbitkan
- Revoke sertifikat

---

### 5.3 Certificate Data Structure

Data yang ditampilkan:

- Nama student
- Nama course
- Level
- Tanggal kelulusan
- Serial number unik
- QR code verifikasi

---

## 6. Non Functional

- Sertifikat tidak boleh digenerate dua kali
- Serial number unik global
- Halaman verifikasi publik via serial number

---

## 7. Acceptance Criteria

Sertifikat hanya bisa digenerate jika:

- Semua module completed
- Semua quiz score >= 80
- Project status LULUS
- Enrollment exists

---

# PRD 2 — FITUR MODUL PELATIHAN

## 1. Overview

Course terdiri dari:

- Beberapa module
- Setiap module:
  - Lesson
  - Quiz

- Di akhir:
  - Final Project

Syarat project:

- Semua module completed
- Semua quiz minimal 80%

---

## 2. Struktur Hierarki

Course
├── Module 1
│ ├── Lesson 1
│ ├── Lesson 2
│ └── Quiz
├── Module 2
│ ├── Lesson
│ └── Quiz
└── Final Project

---

## 3. Behavior Requirement

### 3.1 Lesson

- Student dapat membuka lesson bebas
- Lesson ditandai selesai secara manual

---

### 3.2 Quiz

- Quiz dapat:
  - Dikerjakan setelah lesson
  - Atau langsung (tidak dikunci)

- Score minimal lulus: 80%
- Boleh retake
- Sistem menyimpan attempt tertinggi

---

### 3.3 Module Completion Logic

Module dianggap selesai jika:

- Semua lesson selesai
- Quiz passed

---

### 3.4 Project Unlock Logic

Project dapat diakses jika:

- Semua module selesai
- Semua quiz passed >= 80%

Jika belum:

- Project terkunci
- Sistem menampilkan syarat yang belum terpenuhi

---

### 3.5 Course Completion

Course dianggap selesai jika:

- Semua module selesai
- Project lulus

---

# ANALISIS PERUBAHAN DATABASE (PENTING)

Sekarang kita evaluasi schema kamu.

Saat ini:

- QuizAttempt menyimpan score
- ProjectSubmission tidak menyimpan score numerik
- Enrollment menyimpan array completedLessons & completedQuizzes
- Tidak ada status completion di Module atau Course
- Certificate hanya berdasarkan unique userId + courseId

---

# PERUBAHAN YANG SAYA SARANKAN

## 1. Tambah Field di ProjectSubmission

Tambahkan:

score Float?
passed Boolean?

Karena sekarang hanya ada:
status (PENDING, LULUS, REVISI)

Jika ingin sistem kalkulasi otomatis → perlu numeric score.

---

## 2. Tambah Progress Table (Disarankan)

Daripada pakai array di Enrollment:

Buat tabel baru:

ModuleProgress

- userId
- moduleId
- completedLessonsCount
- quizPassed
- status (COMPLETED / IN_PROGRESS)

CourseProgress

- userId
- courseId
- finalScore
- status (COMPLETED / NOT_COMPLETED)

Ini akan jauh lebih scalable untuk analitik.

---

## 3. Apakah Perlu Field Score di Course?

Ya, jika:

- Kamu ingin kalkulasi nilai akhir
- Sertifikat menampilkan grade

Misalnya:

finalScore =
(Average Quiz Score _ 0.4) +
(Project Score _ 0.6)

Maka perlu:

CourseCompletion

- userId
- courseId
- finalScore
- passed

---

## 4. Perlu Field Score di Quiz?

Sudah ada di QuizAttempt.

Tapi jika ingin simpan bestScore:

- Tambahkan bestScore di Enrollment
  atau
- Query MAX(score)

---

# RINGKASAN PERUBAHAN YANG SAYA REKOMENDASIKAN

Wajib untuk sistem industrial:

- Tambah score di ProjectSubmission
- Tambah passed di ProjectSubmission
- Buat ModuleProgress table
- Buat CourseProgress table
- Tambah grade (A, B, C)
- Tambah certificateTemplate table

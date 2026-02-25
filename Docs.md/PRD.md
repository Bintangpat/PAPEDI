Database acuan:

- users
- courses
- modules
- lessons
- enrollments
- quizzes
- quiz_questions
- quiz_attempts
- project_submissions
- certificates
- refresh_tokens

---

# PRODUCT REQUIREMENTS DOCUMENT

## Role-Based Routing & Page Architecture

---

# 1. Struktur Routing Global

Base route authentication:

- `/auth/login`
- `/auth/register`
- `/auth/verify-otp`
- `/auth/forgot-password`
- `/auth/reset-password`

Setelah login → redirect berdasarkan role:

- `/admin/dashboard`
- `/student/dashboard`
- `/mentor/dashboard`

---

# 2. STUDENT ROUTES

## 2.1 Dashboard

`/student/dashboard`

Fungsi:

- Statistik progres
- Course aktif
- Quiz terbaru
- Project pending review

Data dari:

- enrollments
- quiz_attempts
- project_submissions

---

## 2.2 Profile

`/student/profile`

Fungsi:

- Edit nama
- Edit password
- Lihat email terverifikasi

Data:

- users

---

## 2.3 Courses

`/student/courses`

Menampilkan semua course yang tersedia.

Data:

- courses

---

## 2.4 Course Detail

`/student/courses/:courseId`

Menampilkan:

- Deskripsi
- Module list
- Enrollment button

Data:

- courses
- modules

---

## 2.5 My Courses

`/student/my-courses`

Menampilkan course yang di-enroll.

Data:

- enrollments

---

## 2.6 Module Detail

`/student/my-courses/:courseId/modules/:moduleId`

Menampilkan:

- Lesson list
- Quiz
- Project

Data:

- modules
- lessons
- quizzes

---

## 2.7 Lesson Detail

`/student/my-courses/:courseId/modules/:moduleId/lessons/:lessonId`

Data:

- lessons

---

## 2.8 Quiz Page

`/student/quizzes/:quizId`

Fungsi:

- Render soal pilihan ganda
- Submit jawaban

Data:

- quizzes
- quiz_questions
- quiz_attempts

---

## 2.9 Quiz Result

`/student/quizzes/:quizId/result`

Data:

- quiz_attempts

---

## 2.10 Submit Project

`/student/projects/:moduleId/submit`

Fungsi:

- Upload link
- Upload file
- Tambah deskripsi

Data:

- project_submissions

---

## 2.11 Certificates

`/student/certificates`

Data:

- certificates

---

# 3. MENTOR ROUTES

---

## 3.1 Dashboard

`/mentor/dashboard`

Menampilkan:

- Course yang diajar
- Project pending review
- Statistik peserta

Data:

- courses
- project_submissions
- enrollments

---

## 3.2 Manage Courses

`/mentor/courses`

Menampilkan course yang dimiliki mentor.

---

## 3.3 Create Course

`/mentor/courses/create`

Form:

- Title
- Description
- Category
- Level

Data:

- courses

---

## 3.4 Edit Course

`/mentor/courses/:courseId/edit`

---

## 3.5 Manage Modules

`/mentor/courses/:courseId/modules`

Data:

- modules

---

## 3.6 Create Module

`/mentor/courses/:courseId/modules/create`

---

## 3.7 Manage Lessons

`/mentor/modules/:moduleId/lessons`

Data:

- lessons

---

## 3.8 Create Lesson

`/mentor/modules/:moduleId/lessons/create`

---

## 3.9 Manage Quiz

`/mentor/modules/:moduleId/quizzes`

Data:

- quizzes

---

## 3.10 Create Quiz

`/mentor/modules/:moduleId/quizzes/create`

---

## 3.11 Manage Questions

`/mentor/quizzes/:quizId/questions`

Data:

- quiz_questions

---

## 3.12 Review Project Submissions

`/mentor/projects/review`

Data:

- project_submissions

---

## 3.13 Review Detail

`/mentor/projects/:submissionId`

Fungsi:

- Approve
- Reject
- Beri feedback

---

# 4. ADMIN ROUTES

---

## 4.1 Dashboard

`/admin/dashboard`

Menampilkan:

- Total user
- Total course
- Completion rate
- Active enrollments

Data:

- users
- courses
- enrollments
- quiz_attempts

---

## 4.2 Manage Users

`/admin/users`

---

## 4.3 User Detail

`/admin/users/:userId`

Fungsi:

- Ubah role
- Suspend user

Data:

- users

---

## 4.4 Manage Courses

`/admin/courses`

---

## 4.5 Manage Certificates

`/admin/certificates`

---

## 4.6 Manage Enrollments

`/admin/enrollments`

---

## 4.7 System Logs / Tokens

`/admin/tokens`

Data:

- refresh_tokens

---

# 5. Authorization Rules

Middleware:

- roleCheck(["student"])
- roleCheck(["mentor"])
- roleCheck(["admin"])

Student tidak boleh akses mentor route.
Mentor tidak boleh akses admin route.

---

# 6. UI IMPLEMENTATION GUIDELINES (shadcn)

---

# 6.1 Form Standards

Gunakan komponen:

- `<Form>`
- `<FormField>`
- `<Input>`
- `<Textarea>`
- `<Select>`
- `<Button>`
- `<Label>`

Form validation:

- Gunakan react-hook-form
- Gunakan zod schema validation

---

# 6.2 Error Handling (Human Error Prevention)

Gunakan:

- `<FormMessage>` untuk error field
- `<Alert>` untuk error global
- `<Toast>` untuk notifikasi sukses / gagal

---

## Validasi yang Wajib

- Required field
- Email format
- Password minimal 8 karakter
- URL valid untuk project submission

---

# 6.3 Notifikasi UX Standard

Sukses:
Toast hijau → "Project berhasil dikirim"

Error:
Toast merah → "Terjadi kesalahan, silakan coba lagi"

Warning:
Alert kuning → "Quiz sudah pernah dikerjakan"

---

# 6.4 Loading & Disabled State

Semua button submit:

- Disabled saat loading
- Spinner di dalam button

---

# 6.5 Table UI

Gunakan:

- `<Table>`
- `<Pagination>`
- `<DropdownMenu>` untuk action (Edit, Delete)

---

# 6.6 Confirmation Dialog

Untuk:

- Delete course
- Approve project
- Ubah role user

Gunakan:

- `<AlertDialog>`

---

# 7. Error State Global

Jika:

- 403 → tampilkan halaman Unauthorized
- 404 → Not Found
- 500 → Server Error

Route tambahan:

- `/403`
- `/404`
- `/500`

---

# 8. Non-Functional UX Requirements

- Semua route protected dengan middleware
- Redirect otomatis jika tidak authorized
- Skeleton loading untuk page berat
- Responsive design

---

# 9. Folder Structure Recommendation (Next.js App Router)

```
app/
 ├ auth/
 ├ admin/
 ├ student/
 ├ mentor/
 ├ components/
 ├ lib/
 ├ hooks/
```

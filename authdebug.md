# PRODUCT REQUIREMENTS DOCUMENT (IMPROVED)

## Authentication & Authorization System

---

## 1. Tujuan & Perubahan Utama (Key Improvements)

- **Decoupled OTP:** Memisahkan penyimpanan OTP dari tabel `User` untuk mendukung multiple request.
- **Idempotent Registration:** User dengan email yang sama tetap bisa meminta OTP registrasi ulang jika statusnya belum `isVerified`.
- **Security-First Forgot Password:** Menghilangkan _account enumeration_ (pesan error yang membocorkan daftar email).
- **Strict Rate Limiting:** Implementasi 50 request/menit/user (berdasarkan ID/IP).

---

## 2. User Roles & RBAC (Role-Based Access Control)

| Role        | Landing Page Post-Login | Permissions                                                  |
| ----------- | ----------------------- | ------------------------------------------------------------ |
| **Student** | `/dashboard/student`    | Akses materi, kuis, sertifikat.                              |
| **Mentor**  | `/dashboard/mentor`     | Review proyek, buat course.                                  |
| **Admin**   | `/dashboard/admin`      | Kelola user, validasi pembayaran,Full control + system logs. |

---

## 3. Workflow Logic

### 3.1 Register Flow (The "Upsert" Method)

1. **Input:** Name, Email, Password.
2. **Logic:** \* Cek apakah email sudah ada.

- Jika email ada & `isVerified: true` -> Kembalikan error "Email sudah terdaftar".
- Jika email ada & `isVerified: false` -> Update `name` & `passwordHash` (Upsert).
- Jika email belum ada -> Buat user baru dengan `isVerified: false`.

3. **OTP Action:** Generate 6-digit OTP, simpan di tabel `Otp` (Type: `REGISTER`), kirim email.
4. **Expiry:** 5 Menit (Direkomendasikan dibanding 1 menit untuk toleransi delay email).

### 3.2 Login Flow (2-Step Verification)

1. **Step 1:** Verifikasi Email & Password.
2. **Step 2:** Jika valid, kirim OTP ke email (Type: `LOGIN`).
3. **Step 3:** User input OTP. Jika valid -> Generate JWT (Access & Refresh Token).
4. **Security:** Jika salah input OTP 5 kali, OTP hangus dan user harus login ulang.

### 3.3 Forgot Password Flow

1. **Input:** Email.
2. **Response:** Selalu tampilkan pesan _"Instruksi pengiriman OTP telah dikirim jika email terdaftar"_ (Mencegah brute-force pencarian email).
3. **OTP Verify:** Setelah OTP sukses, jangan langsung ganti password. Redirect ke `/auth/reset-password` dengan membawa **Temporary Reset Token** di URL/State agar aman.

---

## 4. Rate Limiting Specification

Untuk menjaga performa server dari serangan DDoS atau bot:

- **Global Limit:** 50 requests per menit per User ID (atau IP untuk user yang belum login).
- **Auth Specific Limit:**
- **Resend OTP:** Maksimal 3 kali per 10 menit.
- **Login Failure:** Maksimal 5 kali salah password -> Lock akun 15 menit.

- **Implementation:** Menggunakan Redis (Upstash) untuk _sliding window rate limiting_.

---

## 5. Database Schema (Prisma/MongoDB)

```prisma
model User {
  id             String    @id @default(uuid())
  name           String
  email          String    @unique
  passwordHash   String    @map("password_hash")
  role           Role      @default(student)
  isVerified     Boolean   @default(false) @map("is_verified")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  // Relations
  otps           Otp[]
  refreshTokens  RefreshToken[]
}

model Otp {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  otpHash   String   // SHA256 hashed OTP
  type      OtpType
  expiresAt DateTime
  attempts  Int      @default(0)
  createdAt DateTime @default(now())

  @@index([userId])
}

enum OtpType {
  REGISTER
  LOGIN
  FORGOT_PASSWORD
}

enum Role {
  student
  mentor
  admin
  super_admin
}

```

---

## 6. Security Requirements

1. **OTP Hashing:** OTP tidak boleh disimpan dalam teks biasa (Plaintext) di DB. Gunakan `crypto.createHash('sha256')`.
2. **Session:** \* **Access Token:** 15 menit (Stored in Memory/State).

- **Refresh Token:** 7 hari (Stored in HttpOnly, Secure, SameSite Cookie).

3. **Cleanup:** Cron job setiap jam untuk menghapus data di tabel `Otp` yang sudah `expiresAt < now()`.

---

## 7. Success Metrics

- **MTTR (Mean Time to Registration):** < 2 menit dari input data sampai login.
- **OTP Failure Rate:** < 2% (disebabkan provider email).
- **Security:** 0 insiden akun _takeover_ melalui brute-force OTP.

---

**Langkah selanjutnya:**
Apakah Anda ingin saya buatkan **Next.js Middleware** untuk menerapkan aturan **Rate Limit 50 req/menit** tersebut menggunakan Redis?

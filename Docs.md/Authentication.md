Berikut adalah **PRD (Product Requirements Document) – Sistem Autentikasi OTP dengan Resend** untuk platform Bootcamp berbasis MERN + Next.js.

Dokumen ini fokus pada alur autentikasi: Register, Login, dan Lupa Password dengan OTP berbasis email.

---

# PRODUCT REQUIREMENTS DOCUMENT

## Authentication System (OTP-based + Resend Support)

---

# 1. Tujuan Sistem

Membangun sistem autentikasi aman berbasis:

- Email + Password
- OTP verification (One Time Password)
- Resend OTP dengan rate limit
- Reset password dengan OTP
- Redirect sesuai role

Tujuan utama:

- Meningkatkan keamanan akun
- Mencegah login tanpa verifikasi email
- Mencegah brute force
- Mengontrol expiry OTP

---

# 2. Scope

## Termasuk:

- Register dengan OTP
- Login dengan OTP (2-step verification)
- Resend OTP
- Lupa password dengan OTP
- Redirect sesuai role
- Expiry time
- Rate limiting
- Secure session handling

## Tidak termasuk (Fase Lanjutan):

- Social login (Google)
- 2FA authenticator app
- Magic link

---

# 3. User Roles

- Student
- Mentor
- Admin
- Super Admin

Redirect setelah login:

- Student → /dashboard/student
- Mentor → /dashboard/mentor
- Admin → /dashboard/admin

---

# 4. Flow Overview

---

# 4.1 REGISTER FLOW

### URL:

`/auth/register`

### Step 1 – Input Form

User mengisi:

- Nama
- Email
- Password

Validasi:

- Email belum terdaftar
- Password minimal 8 karakter
- Password di-hash sebelum disimpan (bcrypt)

Status user saat ini:

- isVerified = false

Setelah submit:

- Generate OTP (6 digit)
- Simpan OTP hash
- Set expiry 1 menit
- Kirim OTP ke email
- Jika user tidak menginput OTP yang terjadi adalah data user tidak akan terbuat atau dihapus

Redirect:
`/auth/verify-otp?type=register&email=user@email.com`

---

### Step 2 – Verifikasi OTP

Input:

- OTP 6 digit

Validasi:

- OTP cocok
- Belum expired (1 menit)
- Belum dipakai

Jika sukses:

- isVerified = true
- Hapus OTP
- Redirect ke `/auth/login`

Jika gagal:

- Tampilkan error
- Jika expired → minta resend

---

# 4.2 LOGIN FLOW (2-Step Verification)

### URL:

`/auth/login`

---

### Step 1 – Input Email & Password

Validasi:

- Email ada
- Password cocok
- isVerified = true

Jika valid:

- Generate OTP login
- Expiry 1 menit
- Kirim email

Redirect:
`/auth/verify-otp?type=login`

---

### Step 2 – Verifikasi OTP Login

Input:

- OTP 6 digit

Validasi:

- OTP cocok
- Tidak expired
- Belum digunakan

Jika sukses:

- Generate JWT
- Set HttpOnly cookie
- Redirect sesuai role

---

# 4.3 LUPA PASSWORD FLOW

### URL:

`/auth/forgot-password`

---

### Step 1 – Input Email

Validasi:

- Email terdaftar

Generate:

- OTP reset password
- Expiry 1 menit

Redirect:
`/auth/verify-otp?type=reset`

---

### Step 2 – Verifikasi OTP Reset

Jika valid:
Redirect ke:
`/auth/reset-password`

---

### Step 3 – Reset Password

Input:

- Password baru
- Konfirmasi password

Validasi:

- Minimal 8 karakter
- Cocok

Update:

- Hash password baru
- Invalidate semua session lama
- Hapus OTP

Redirect:
`/auth/login`

---

# 5. OTP System Specification

---

## OTP Format

- 6 digit numeric
- Random
- Tidak predictable

Contoh:
483921

---

## OTP Expiry

Semua OTP:

- Expire dalam 1 menit
- Otomatis invalid setelah dipakai

---

## Resend OTP

Fitur:

- Tombol “Resend OTP”
- Cooldown 30 detik
- Maksimal 5 kali per jam

Jika melebihi:

- Temporary block 1 jam

---

# 6. Security Requirements

---

## 6.1 Password

- Hash: bcrypt (salt 10+)
- Tidak disimpan plaintext

---

## 6.2 OTP Storage

Disimpan dalam bentuk:

- Hashed OTP (SHA256)
- expiryDate
- attemptCount

---

## 6.3 Rate Limiting

Login:

- Maksimal 5 percobaan salah
- Lock 15 menit

OTP verify:

- Maksimal 5 kali salah

Resend OTP:

- Maksimal 5 kali / jam

---

## 6.4 Token Management

JWT:

- Access token 15 menit
- Refresh token 7 hari
- Disimpan di HttpOnly cookie

---

## 6.5 Session Invalidation

Saat:

- Reset password
- Logout
- Login dari device baru (opsional)

---

# 7. Database Schema (MongoDB)

---

## User

- \_id
- name
- email (unique)
- passwordHash
- role
- isVerified
- createdAt
- updatedAt

---

## OTP

- userId
- type (register/login/reset)
- otpHash
- expiresAt
- attempts
- createdAt

---

## Session (Optional)

- userId
- refreshToken
- userAgent
- ipAddress
- expiresAt

---

# 8. API Endpoints

---

POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify-otp
POST /api/auth/resend-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/logout

---

# 9. UI Requirements

---

## Register Page

- Form validation realtime
- Show password strength
- Disable button saat loading

---

## OTP Page

- 6 digit input auto focus
- Countdown timer
- Resend button (disabled saat cooldown)

---

## Login Page

- Error message jelas
- Link ke forgot password

---

# 10. Non-Functional Requirements

Performance:

- OTP email terkirim < 5 detik

Security:

- HTTPS wajib
- CSRF protection
- XSS protection

Scalability:

- OTP cleanup cron job

Availability:

- Retry email sending

---

# 11. Edge Cases

1. OTP expired
2. OTP salah berkali-kali
3. Email tidak ditemukan
4. Double submit
5. Network failure
6. Email delay
7. User klik resend berulang

---

# 12. Success Metrics

- OTP delivery success rate > 98%
- Login success rate
- Reset password completion rate
- Account hijack incidents = 0

---

# 13. MVP Scope

Untuk fase awal:

- Email OTP
- 1 menit expiry
- Resend basic limit
- JWT session
- Role redirect

Tanpa:

- Device tracking
- Advanced anomaly detection
- Multi-factor via authenticator

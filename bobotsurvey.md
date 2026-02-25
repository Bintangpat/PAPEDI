Baik. Karena kategori pelatihan hanya:

- `WEBDEV`
- `SEO`
- `SOCIAL_MEDIA`

Maka pertanyaan survei harus diarahkan secara eksplisit agar hasilnya bisa dipetakan akurat ke tiga kategori tersebut tanpa ambiguitas.

Berikut versi final yang sudah disesuaikan dengan enum kamu.

---

# SURVEY PEMINATAN PELATIHAN

(5 Step – Siap untuk Multiple Step Form)

---

## Step 1 – Tujuan Utama

**Pertanyaan:**
Apa tujuan utama kamu mengikuti pelatihan ini?

**Pilihan Jawaban:**

1. Saya ingin bisa membuat dan mengelola website sendiri
2. Saya ingin meningkatkan traffic dan ranking website di Google
3. Saya ingin mengembangkan bisnis atau personal branding melalui media sosial
4. Saya ingin membuka jasa digital (freelance/agency)
5. Saya masih eksplorasi dan ingin mencoba bidang yang cocok

**Mapping utama:**

- (1) → WEBDEV
- (2) → SEO
- (3) → SOCIAL_MEDIA
- (4) → tergantung preferensi berikutnya (weighted)
- (5) → weighted dari pertanyaan lain

---

## Step 2 – Minat Aktivitas

**Pertanyaan:**
Aktivitas mana yang paling menarik untuk kamu lakukan?

**Pilihan Jawaban:**

1. Mendesain dan membangun tampilan website
2. Mengoptimasi website agar muncul di halaman pertama Google
3. Membuat konten dan mengelola akun media sosial
4. Menganalisis performa website dan data pengunjung
5. Mengelola campaign promosi online

**Mapping:**

- (1) → WEBDEV
- (2) → SEO
- (3) → SOCIAL_MEDIA
- (4) → SEO (+ minor WEBDEV)
- (5) → SOCIAL_MEDIA (+ minor SEO)

---

## Step 3 – Tingkat Pengalaman

**Pertanyaan:**
Seberapa pengalaman kamu saat ini?

**Pilihan Jawaban:**

1. Pemula (belum pernah belajar sebelumnya)
2. Pernah mencoba belajar secara otodidak
3. Sudah pernah membuat project kecil
4. Sudah pernah bekerja atau mengelola bisnis digital

**Mapping:**

Ini tidak menentukan kategori, tetapi menentukan level rekomendasi:

- 1 → Beginner
- 2 → Beginner/Intermediate
- 3 → Intermediate
- 4 → Advanced

---

## Step 4 – Fokus Hasil yang Diinginkan

**Pertanyaan:**
Hasil apa yang paling ingin kamu capai dalam 3–6 bulan ke depan?

**Pilihan Jawaban:**

1. Memiliki website profesional yang berjalan dengan baik
2. Website saya muncul di halaman pertama Google
3. Akun media sosial saya tumbuh dan menghasilkan engagement tinggi
4. Mendapatkan klien dari layanan digital

**Mapping:**

- (1) → WEBDEV
- (2) → SEO
- (3) → SOCIAL_MEDIA
- (4) → weighted dari skor tertinggi sebelumnya

---

## Step 5 – Preferensi Gaya Kerja

**Pertanyaan:**
Kamu lebih nyaman bekerja dengan tipe aktivitas seperti apa?

**Pilihan Jawaban:**

1. Coding dan membangun sistem
2. Analisis data dan optimasi performa
3. Kreatif membuat konten dan visual
4. Strategi pemasaran dan campaign

**Mapping:**

- (1) → WEBDEV
- (2) → SEO
- (3) → SOCIAL_MEDIA
- (4) → SOCIAL_MEDIA (+ minor SEO)

---

# SCORING STRATEGY (Direkomendasikan)

Gunakan sistem weighted scoring:

- Jawaban utama kategori → +3 poin
- Jawaban minor kategori → +1 poin

Contoh hasil akhir:

WEBDEV = 9
SEO = 5
SOCIAL_MEDIA = 3

Rekomendasi → WEBDEV

Jika seri:

- Gunakan jawaban Step 1 sebagai penentu utama.

---

# OUTPUT REKOMENDASI

Setelah submit:

Rekomendasi Utama:
→ WEBDEV

Deskripsi singkat:
“Kamu cocok untuk belajar membangun dan mengembangkan website dari dasar hingga production.”

Tombol:

- Lihat Pelatihan
- Lewati

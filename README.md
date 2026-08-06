
# LeanManage Kanban # LeanManage Kanban Bot 🤖📊

LeanManage adalah sistem manajemen operasional (Kanban) berbasis Telegram Bot yang dirancang khusus dengan mengadopsi prinsip **Lean System** dan **Toyota Way**. 

Bot ini bertindak sebagai asisten operasional cerdas yang memungkinkan tim untuk mencatat tugas, menetapkan target penyelesaian (SLA), mendeteksi pemborosan (duplikasi/redundansi), serta mengukur efisiensi kerja (*Lead Time*) secara instan dari aplikasi Telegram.

---

## 🌟 Fitur Utama (Minimum Viable Product v1.0.0)

1. **Menu Interaktif & Panduan Informasi (`/start`)**
   Menyediakan sapaan fungsional interaktif yang langsung menjelaskan identitas bot, kegunaan utama, pencapaian sistem, serta tombol menu biru (`/`) di Telegram untuk akses perintah yang mudah. 
2. **Pencatatan Otomatis via AI (Natural Language Processing)**
   Cukup ketik tugas menggunakan bahasa sehari-hari. Bot menggunakan **Claude 3 Haiku** untuk mengekstrak Judul, Prioritas, dan Departemen, lalu menyimpannya secara otomatis ke papan Kanban.
3. **Poka-Yoke (Sistem Anti-Duplikasi)**
   Bot memiliki mekanisme perlindungan otomatis untuk mencegah masuknya tugas dengan judul yang identik, menghilangkan pemborosan (*waste*) administratif akibat data ganda.
4. **Kepemilikan Jelas (Clear Ownership)**
   Menghindari ambiguitas tanggung jawab (*Diffusion of Responsibility*). Anggota tim dapat mengambil tugas (*Pull System* via tombol `[🙋 Ambil]`) atau ditugaskan secara manual oleh manajer (*Push System* via `/assign`).
5. **Pelacakan SLA (Service Level Agreement)**
   Menetapkan target hari penyelesaian (`/due`). Bot akan mengawasi tugas-tugas ini dan memberikan bendera ⚠️ OVERDUE jika tugas melewati tenggat waktu.
6. **Penghitungan Lead Time Aktual**
   Saat tugas ditandai selesai, sistem akan menghitung durasi waktu secara *real-time* (dalam Hari, Jam, Menit) dari sejak tugas diciptakan hingga selesai.
7. **Laporan Eksekutif Harian (AI Review)**
   Perintah `/review` akan menginstruksikan AI untuk membaca seluruh isi *database*, mengidentifikasi *bottleneck*, dan memberikan rekomendasi Kaizen bagi tim.

---

## 🛠️ Tech Stack

Sistem ini dibangun di atas infrastruktur modern dan tangguh:
- **Runtime & Bahasa:** Node.js, TypeScript
- **Bot Framework:** Telegraf (Telegram Bot API)
- **Database:** PostgreSQL
- **ORM:** Prisma Client & Prisma Pg Adapter
- **AI:** Anthropic SDK (Model: claude-haiku-4-5-20251001)

---

## 🚀 Panduan Instalasi

```bash
# 1. Kloning Repositori
git clone [https://github.com/Faber-Aritonang/leanmanage-bot.git](https://github.com/Faber-Aritonang/leanmanage-bot.git)
cd leanmanage-bot

# 2. Instalasi Dependensi
npm install

# 3. Buat file .env dan isi dengan token Anda
# TELEGRAM_BOT_TOKEN, ANTHROPIC_API_KEY, DATABASE_URL

# 4. Sinkronisasi Database
npx prisma db push
npx prisma generate

# 5. Jalankan Bot
npx tsx src/index.tsBot 🤖📊

LeanManage adalah sistem manajemen operasional (Kanban) berbasis Telegram Bot yang dirancang khusus dengan mengadopsi prinsip **Lean System** dan **Toyota Way**. 

Bot ini bertindak sebagai asisten operasional cerdas yang memungkinkan tim untuk mencatat tugas, menetapkan target penyelesaian (SLA), mendeteksi pemborosan (duplikasi/redundansi), serta mengukur efisiensi kerja (*Lead Time*) secara instan dari aplikasi Telegram.

---
## 🌟 Versi & Histori Rilis

### 🚀 v1.2.0 (Executive Web Dashboard)
- **Executive Web Dashboard (Next.js & Tailwind CSS):** Antarmuka web visual eksternal (Andon) untuk memantau performa operasional langsung dari browser.
- **KPI Metrics Cards:** Ringkasan Total Task Aktif, Task WIP, SLA Compliance, dan Deteksi Bottleneck/Overdue secara *real-time*.
- **Workload Balance Analytics:** Tabel analitik untuk memantau beban kerja masing-masing anggota tim agar terhindar dari *overburden* (*muri*).
- **Database Synchronization:** Terhubung secara langsung dengan Prisma dan PostgreSQL yang sama dengan Telegram Bot.

### 🤖 v1.1.0 (Interactive Menu & Onboarding)
- **Menu Interaktif (`/start`):** Informasi fungsional sistem, kegunaan utama, serta pencapaian penggunaan bot yang jelas.
- **Telegram Bot Commands Menu:** Tombol menu biru (`/`) di Telegram untuk akses perintah cepat.

### 📌 v1.0.0 (Minimum Viable Product - Core Kanban & AI)
- **Natural Language Processing (NLP):** Pencatatan task otomatis via Claude 3 Haiku dari teks percakapan bebas.
- **Poka-Yoke:** Sistem anti-duplikasi tugas identik.
- **Clear Ownership & SLA Tracking:** Fitur ambil task otomatis (`[🙋 Ambil]`), penugasan (`/assign`), dan batas waktu (`/due`).
- **Lead Time Measurement:** Penghitungan durasi aktual penyelesaian tugas secara akurat.
- **AI Executive Review (`/review`):** Laporan analitik harian dan rekomendasi Kaizen.

---

## 🛠️ Tech Stack

Sistem ini dibangun di atas infrastruktur modern dan tangguh:
- **Runtime & Bahasa:** Node.js, TypeScript
- **Bot Framework:** Telegraf (Telegram Bot API)
- **Database:** PostgreSQL
- **ORM:** Prisma Client & Prisma Pg Adapter
- **AI:** Anthropic SDK (Model: claude-haiku-4-5-20251001)

---

## 🚀 Panduan Instalasi

```bash
# 1. Kloning Repositori
git clone [https://github.com/Faber-Aritonang/leanmanage-bot.git](https://github.com/Faber-Aritonang/leanmanage-bot.git)
cd leanmanage-bot

# 2. Instalasi Dependensi
npm install

# 3. Buat file .env dan isi dengan token Anda
# TELEGRAM_BOT_TOKEN, ANTHROPIC_API_KEY, DATABASE_URL

# 4. Sinkronisasi Database
npx prisma db push
npx prisma generate

# 5. Jalankan Bot
npx tsx src/index.ts

📖 Daftar Perintah Bot Telegram
Perintah                                        Deskripsi
(Teks Biasa)                                  Menambahkan tugas baru menggunakan bahasa natural.
/list                                         Menampilkan 5 tugas terbaru di papan Kanban umum.
/board <Dept>                                 Memfilter tugas berdasarkan departemen.
/assign <ID> <Nama>                           Menugaskan tugas ke anggota tim tertentu.
/due <ID> <Hari>                              Menetapkan target penyelesaian (SLA).
/review                                       Laporan analitik harian, deteksi bottleneck.
/delete <ID>                                  Menghapus tugas dari sistem secara manual.

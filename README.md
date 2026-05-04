# MON Studio

Collaborative photo editing tracker for studios. Manage pre-wedding and wedding project workflows with real-time progress syncing between owners and editors.

## 🚀 Fitur Utama

- **Workflow Tracking**: Pantau setiap tahapan project (Upload, Selection, Editing, Review, Done).
- **Real-time Sync**: Sinkronisasi data otomatis via Firebase Firestore.
- **Role Management**: Perbedaan akses antara Owner dan Editor.
- **Minimalist Noir UI**: Desain gelap yang elegan dan fokus pada produktivitas.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS 4
- **Database & Auth**: Firebase Firestore & Firebase Authentication (Google Login)
- **Animations**: Motion (framer-motion)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 📦 Instalasi & Penggunaan

### Prasyarat
- Node.js installed
- Firebase Project configured

### Langkah-langkah
1. Clone project atau gunakan source code ini.
2. Install dependensi:
   ```bash
   npm install
   ```
3. Jalankan server development:
   ```bash
   npm run dev
   ```
4. Build untuk produksi:
   ```bash
   npm run build
   ```

## 🔐 Konfigurasi Firebase

Project ini menggunakan Firebase. Jika Anda memindahkan project ini ke lingkungan baru (seperti Vercel), pastikan untuk:

1. **Authorized Domains**: Tambahkan domain baru Anda (contoh: `mon-studio.vercel.app`) ke list **Authorized Domains** di Firebase Console -> Authentication -> Settings.
2. **Environment Variables**: Jika menggunakan environment variables, pastikan `VITE_` prefix digunakan untuk key yang diakses di client-side.

## 📁 Struktur Folder

- `src/components`: UI Components (Dashboard, ProjectDetail, dll).
- `src/services`: Logic untuk interaksi data (Firestore).
- `src/lib`: Konfigurasi library (Firebase init).
- `firestore.rules`: Aturan keamanan database.

---
Dikembangkan dengan ❤️ di Google AI Studio.

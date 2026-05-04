# Panduan Setup Firebase untuk MON Studio

Jika Anda mengalami error seperti `auth/unauthorized-domain` atau `403 Forbidden` saat login atau mengakses database, ikuti langkah-langkah berikut:

## 1. Menambahkan Authorized Domains (Sangat Penting)

Firebase Authentication secara default hanya mengizinkan login dari `localhost` dan domain `.firebaseapp.com`. Jika Anda mendeploy ke domain lain (seperti Vercel atau domain custom):

1. Buka [Firebase Console](https://console.firebase.google.com/).
2. Pilih project Anda: `gen-lang-client-0140042638`.
3. Pergi ke menu **Authentication** di sidebar kiri.
4. Klik tab **Settings**.
5. Di menu kiri settings, klik **Authorized domains**.
6. Klik **Add domain** dan masukkan domain website Anda (contoh: `mon-studio.vercel.app`).

## 2. Struktur Database (Firestore)

Project ini menggunakan koleksi berikut:
- `users`: Menyimpan data profile user (email, role).
- `projects`: Menyimpan data project foto, status workflow, dan file list.

### Roles (Peran)
Secara default, user yang pertama kali login akan masuk sebagai user biasa. Anda bisa mengubah role user menjadi `owner` atau `editor` melalui console Firestore jika diperlukan untuk bypass aturan keamanan tertentu.

## 3. Deployment Rules

Setiap kali ada perubahan pada file `firestore.rules`, Anda harus mendeploy-nya melalui CLI atau menyalin isinya ke tab **Rules** di bagian Firestore di Firebase Console.

Aturan saat ini mengizinkan:
- Baca data jika sudah login.
- Tulis data `users` hanya untuk profile sendiri.
- Tulis data `projects` hanya jika user terautentikasi.

## 4. Reset Koneksi
Jika database terasa "stuck", pastikan Database ID di `firebase-applet-config.json` sesuai dengan yang ada di console. Database ID saat ini: `ai-studio-31418c0e-ff10-449f-9ca7-9fcee143c357`.

// File: next.config.js
// LOKASI: Folder utama (root)
//
// PERBAIKAN: Memastikan konfigurasi domain Next.js Image sudah lengkap untuk backend dan placeholder.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.bonang.my.id', // Domain backend WordPress
        port: '',
        pathname: '/**', // Izinkan semua path di domain ini
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Domain untuk gambar placeholder
        port: '',
        pathname: '/**', // Izinkan semua path di domain ini
      },
    ],
    // Menonaktifkan optimasi image default Next.js agar URL placeholder yang kompleks tidak rusak (400 Bad Request)
    // NOTE: Ini hanya diterapkan jika Anda menghapus unoptimized={true} dari komponen Image.
    // Saat ini, unoptimized={true} di komponen sudah menjadi solusi yang baik.
  },
};

module.exports = nextConfig;

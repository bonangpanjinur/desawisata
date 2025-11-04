// File: next.config.js
// LOKASI: Folder utama (root)
//
// Menggunakan format 'remotePatterns' yang lebih modern
// Ini menggantikan format 'domains' yang lama
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.sadesa.site',
        port: '',
        pathname: '/**', // Izinkan semua path di domain ini
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**', // Izinkan semua path di domain ini
      },
    ],
  },
};

module.exports = nextConfig;


// File: next.config.js
// LOKASI: Folder utama (root)
//
// PERBAIKAN: Mengganti admin.sadesa.site dengan admin.bonang.my.id
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.bonang.my.id', // PERBAIKAN DI SINI
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

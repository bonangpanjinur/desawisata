// File: next.config.js
// INI FILE BARU. File ini sangat penting untuk memperbaiki error gambar.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Mendaftarkan domain-domain yang boleh diakses oleh komponen <Image>
    domains: [
      'admin.sadesa.site', // Domain backend WordPress Anda
      'placehold.co',      // Domain placeholder
    ],
  },
};

module.exports = nextConfig;

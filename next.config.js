/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.bonang.my.id', // PERBAIKAN: Menambahkan domain backend Anda
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', // Domain untuk gambar placeholder
      },
      // Anda bisa menambahkan domain lain di sini jika perlu
    ],
  },
};

module.exports = nextConfig;
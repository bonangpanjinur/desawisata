/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Anda bisa mengambil warna utama dari API /settings nantinya
        primary: {
          DEFAULT: 'var(--color-primary)',
          dark: 'var(--color-primary-dark)',
        },
        secondary: '#f4f4f5', // zinc-100
        background: '#ffffff',
      },
      // Sesuai dengan BottomNavBar
      padding: {
        'pb-safe': 'pb-[96px]', // 80px navbar + 16px padding
      }
    },
  },
  plugins: [],
};


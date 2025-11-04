// src/components/Layout.js
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import Header from './Header';
import BottomNavBar from './BottomNavBar';

export default function Layout({ children }) {
  // Ambil data branding (logo, warna) dari API saat layout dimuat
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiFetch('/settings');
        // Terapkan warna utama ke CSS variables di :root
        if (settings.warna_utama) {
          document.documentElement.style.setProperty('--color-primary', settings.warna_utama);
          // Hitung warna lebih gelap untuk hover (contoh sederhana, bisa lebih canggih)
          // Ini sedikit rumit, jadi kita bisa hardcode warna dark di CSS atau menghitungnya
          // Untuk saat ini, kita set warna primary saja.
        }
        // TODO: Simpan logo_frontend dan nama_website di store global
      } catch (error) {
        console.error("Gagal mengambil public settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      <Header />
      {/* Container utama 
        - mx-auto: center
        - max-w-5xl: batas lebar di desktop
        - px-4: padding horizontal
        - pb-safe: padding bottom agar tidak tertutup BottomNavBar (lihat globals.css)
      */}
      <main className="container mx-auto min-h-screen max-w-5xl px-4 pt-4 pb-safe">
        {children}
      </main>
      <BottomNavBar />
    </>
  );
}


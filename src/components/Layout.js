// src/components/Layout.js
// UI/UX: Menambahkan judul ke Header
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Header from './Header';
import BottomNavBar from './BottomNavBar';

export default function Layout({ children }) {
  // State untuk menyimpan nama website dari API
  const [websiteTitle, setWebsiteTitle] = useState('Sadesa.site'); // Default title

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiFetch('/settings');
        // Terapkan warna utama ke CSS variables di :root
        if (settings.warna_utama) {
          document.documentElement.style.setProperty('--color-primary', settings.warna_utama);
          // TODO: Hitung warna dark (jika diperlukan)
        }
        // Simpan nama website
        if (settings.nama_website) {
          setWebsiteTitle(settings.nama_website);
        }
      } catch (error) {
        console.error("Gagal mengambil public settings:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      {/* Kirim websiteTitle ke Header */}
      <Header title={websiteTitle} />
      <main className="container mx-auto min-h-screen max-w-5xl px-4 pt-4 pb-safe">
        {children}
      </main>
      <BottomNavBar />
    </>
  );
}

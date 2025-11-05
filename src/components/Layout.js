// src/components/Layout.js
// PERBAIKAN: Mengirim 'title' ke Header
// PERBAIKAN: Memanggil 'apiGetPublicSettings' yang baru dibuat
import { useEffect, useState } from 'react';
import { apiGetPublicSettings } from '@/lib/api'; // PERBAIKAN: Impor fungsi yang benar
import Header from './Header';
import BottomNavBar from './BottomNavBar';

export default function Layout({ children }) {
  const [websiteTitle, setWebsiteTitle] = useState('Sadesa.site'); // Default title

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await apiGetPublicSettings(); // PERBAIKAN: Panggil fungsi yang benar
        
        if (settings.warna_utama) {
          document.documentElement.style.setProperty('--color-primary', settings.warna_utama);
          // TODO: Hitung warna dark
        }
        if (settings.nama_website) {
          setWebsiteTitle(settings.nama_website);
        }
      } catch (error) {
        // Interceptor di api.js akan menangani toast error
        console.error("Gagal mengambil public settings:", error.message);
      }
    };
    fetchSettings();
  }, []);

  return (
    <>
      {/* PERBAIKAN: Kirim websiteTitle ke Header */}
      <Header title={websiteTitle} />
      <main className="container mx-auto min-h-screen max-w-5xl px-4 pt-4 pb-safe">
        {children}
      </main>
      <BottomNavBar />
    </>
  );
}
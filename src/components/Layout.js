// src/components/Layout.js
// PERBAIKAN: Mengirim 'title' ke Header
// PERBAIKAN: Menambahkan 'apiGetPublicSettings' ke api.js dan memanggilnya
import { useEffect, useState } from 'react';
import { apiGetPublicSettings } from '@/lib/api'; // PERBAIKAN: Ganti apiFetch ke apiGetPublicSettings
import Header from './Header';
import BottomNavBar from './BottomNavBar';

export default function Layout({ children }) {
  // State untuk menyimpan nama website dari API
  const [websiteTitle, setWebsiteTitle] = useState('Sadesa.site'); // Default title

  useEffect(() => {
    // Fungsi ini memanggil endpoint /settings
    // Pastikan endpoint ini ada di backend (api-public.php)
    const fetchSettings = async () => {
      try {
        const settings = await apiGetPublicSettings(); // PERBAIKAN: Panggil fungsi yang benar
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
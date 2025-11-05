// src/pages/_app.js
// PERBAIKAN: Menghapus panggilan 'hydrate()' manual
// karena 'persist' dari Zustand sudah menanganinya secara otomatis.

import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
// Impor store tidak diperlukan di sini
// import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  
  // PERBAIKAN: Blok 'useEffect' ini dihapus
  // 'persist' middleware sudah menangani hidrasi secara otomatis.
  /*
  useEffect(() => {
    useAuthStore.getState().hydrate();
    useCartStore.getState().hydrate();
  }, []);
  */
  // --- AKHIR PERBAIKAN ---

  return (
    <>
      <Component {...pageProps} />
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
        }}
      />
    </>
  );
}

export default MyApp;
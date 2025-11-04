// src/pages/_app.js
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
// import { useCartStore } from '@/store/cartStore'; // Hapus impor yang tidak terpakai

export default function App({ Component, pageProps }) {
  
  // --- PERBAIKAN KRITIS ---
  // Kode di bawah ini dihapus/dikomentari karena:
  // 1. `useCartStore` (di file `src/store/cartStore.js`) tidak memiliki fungsi bernama `fetchCart`.
  // 2. Ini menyebabkan error runtime di sisi klien dan menghentikan aplikasi.
  // 3. Logika cart Anda saat ini murni berbasis Local Storage, jadi fetch saat load tidak diperlukan.
  
  // const { user } = useAuthStore();
  // const { fetchCart } = useCartStore(); 
  // useEffect(() => {
  //   fetchCart(); 
  // }, [user, fetchCart]);
  
  return <Component {...pageProps} />;
}

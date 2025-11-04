// src/pages/_app.js
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
// Hapus import useCartStore jika tidak digunakan di sini
// import { useCartStore } from '@/store/cartStore';

export default function App({ Component, pageProps }) {
  // const { user } = useAuthStore();
  // const { fetchCart } = useCartStore(); // DIHAPUS: Fungsi ini tidak ada di cartStore.js

  // Ambil keranjang dari backend setiap kali user (login/logout) berubah
  // useEffect(() => {
  //   fetchCart(); // DIHAPUS: Ini menyebabkan error
  // }, [user, fetchCart]);

  // Karena logic di atas dihapus, file _app.js menjadi lebih sederhana
  // dan kita bisa hapus import yang tidak terpakai.
  return <Component {...pageProps} />;
}

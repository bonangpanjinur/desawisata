// src/pages/_app.js
import '@/styles/globals.css';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export default function App({ Component, pageProps }) {
  const { user } = useAuthStore();
  const { fetchCart } = useCartStore();

  // Ambil keranjang dari backend setiap kali user (login/logout) berubah
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  return <Component {...pageProps} />;
}


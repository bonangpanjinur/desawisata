// src/components/Header.js
// PERBAIKAN: Menerapkan logic useState/useEffect untuk mencegah error SSR
// pada hitungan keranjang.
// PERBAIKAN: Menerima prop 'title' dari Layout.

import { useState, useEffect } from 'react'; // PERBAIKAN: Import
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconSearch, IconCart, IconChevronLeft } from './icons';
import { useCartStore } from '@/store/cartStore'; // PERBAIKAN: Impor bernama

export default function Header({ title }) { // PERBAIKAN: Terima 'title'
  const router = useRouter();
  
  // PERBAIKAN: Ambil state 'cart' dari store
  const cart = useCartStore(state => state.cart);
  
  // PERBAIKAN: Buat state untuk cartItemCount, default 0
  const [cartItemCount, setCartItemCount] = useState(0);

  // PERBAIKAN: Gunakan useEffect untuk menghitung di client-side
  useEffect(() => {
    const count = (cart || []).reduce((acc, item) => acc + item.quantity, 0);
    setCartItemCount(count);
  }, [cart]); // Jalankan setiap 'cart' berubah

  // Logika untuk menampilkan header yang berbeda
  const isHomePage = router.pathname === '/';
  
  // Tampilkan header simpel jika bukan di beranda
  if (!isHomePage) {
    let pageTitle = "Kembali";
    if (router.pathname.startsWith('/product/')) pageTitle = "Detail Produk";
    if (router.pathname.startsWith('/wisata/')) pageTitle = "Detail Wisata";
    if (router.pathname.startsWith('/desa/')) pageTitle = "Detail Desa";
    if (router.pathname.startsWith('/toko/')) pageTitle = "Detail Toko";
    if (router.pathname === '/jelajah') pageTitle = "Jelajah";
    if (router.pathname === '/keranjang') pageTitle = "Keranjang";
    if (router.pathname === '/akun') pageTitle = "Akun Saya";
    if (router.pathname === '/checkout') pageTitle = "Checkout";
    if (router.pathname.startsWith('/pesanan/')) pageTitle = "Detail Pesanan";

    return (
      <header className="sticky top-0 z-40 w-full border-b bg-background shadow-sm md:hidden">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="p-2">
            <IconChevronLeft className="h-6 w-6" />
          </button>
          <span className="text-lg font-semibold truncate">
            {pageTitle}
          </span>
          {/* PERBAIKAN: Tambah keranjang di halaman detail */}
          <Link href="/keranjang" className="relative p-2">
              <IconCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
          </Link>
        </div>
      </header>
    );
  }

  // Header lengkap untuk Beranda
  return (
    <header className="sticky top-0 z-40 w-full bg-background shadow-sm md:hidden">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        {/* PERBAIKAN: Tampilkan judul website */}
        <div className="text-xl font-bold text-primary truncate">
          {title || 'Sadesa.site'}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/jelajah" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 p-2">
              <IconSearch className="h-5 w-5 text-gray-500" />
          </Link>

          <Link href="/keranjang" className="relative p-2">
              <IconCart className="h-6 w-6" />
              {/* PERBAIKAN: Gunakan state cartItemCount */}
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
          </Link>
        </div>
      </div>
    </header>
  );
}
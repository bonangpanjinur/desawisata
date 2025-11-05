// File: src/components/BottomNavBar.js
// PERBAIKAN: 
// Mencegah error hydration SSR dengan menggunakan useState dan useEffect
// untuk menghitung isi keranjang HANYA di sisi client.

import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react'; // PERBAIKAN: Import
import { IconHome, IconSearch, IconCart, IconUser } from './icons'; 
import { useCartStore } from '@/store/cartStore'; // PERBAIKAN: Impor bernama

const navItems = [
  { href: '/', label: 'Beranda', icon: IconHome },
  { href: '/jelajah', label: 'Jelajah', icon: IconSearch },
  { href: '/keranjang', label: 'Keranjang', icon: IconCart },
  { href: '/akun', label: 'Akun', icon: IconUser },
];

export default function BottomNavBar() {
  const router = useRouter();
  
  // PERBAIKAN: Ambil state 'cart' dari store
  const cart = useCartStore(state => state.cart);
  
  // PERBAIKAN: Buat state 'cartItemCount', default 0 (untuk SSR)
  const [cartItemCount, setCartItemCount] = useState(0);

  // PERBAIKAN: Gunakan useEffect (hanya berjalan di client)
  useEffect(() => {
    // Hitung jumlah item dari state 'cart' yang sudah terhidrasi
    const count = (cart || []).reduce((acc, item) => acc + item.quantity, 0);
    setCartItemCount(count);
  }, [cart]); // Jalankan efek ini setiap kali 'cart' berubah

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-background shadow-lg md:hidden">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4 pb-4">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`relative flex flex-col items-center justify-center gap-1 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
              {/* PERBAIKAN: Gunakan state 'cartItemCount' */}
              {item.href === '/keranjang' && cartItemCount > 0 && (
                <span className="absolute -top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
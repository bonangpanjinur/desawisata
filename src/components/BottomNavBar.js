// File: src/components/BottomNavBar.js
// PERBAIKAN: Mengambil 'cart' (bukan 'items') dari useCartStore
// dan menambahkan null check '|| []' untuk 'reduce' agar aman saat SSR.

import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconHome, IconSearch, IconCart, IconUser, IconMap } from './icons'; 
import { useCartStore } from '@/store/cartStore';

const navItems = [
  { href: '/', label: 'Beranda', icon: IconHome },
  { href: '/jelajah', label: 'Jelajah', icon: IconSearch },
  { href: '/keranjang', label: 'Keranjang', icon: IconCart },
  { href: '/akun', label: 'Akun', icon: IconUser },
];

export default function BottomNavBar() {
  const router = useRouter();
  
  // PERBAIKAN: Ambil 'cart' (nama state di store) bukan 'items'
  const items = useCartStore(state => state.cart);
  
  // PERBAIKAN: Tambahkan (items || []) untuk mencegah error 'reduce of undefined'
  const cartItemCount = (items || []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-background shadow-lg md:hidden">
      {/* PERBAIKAN: Sesuaikan tinggi dan padding bottom untuk iPhone */}
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

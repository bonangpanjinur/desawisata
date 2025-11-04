// src/components/Header.js
// UI/UX: Menerima props 'title'
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { IconCart, IconUser, IconSearch } from '@/components/icons'; // Tambah IconSearch

export default function Header({ title }) {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          {/* Ganti dengan logo dari API Settings jika ada */}
          {/* Tampilkan title dari props */}
          <span className="text-lg font-bold text-primary">{title || 'Sadesa.site'}</span>
        </Link>
        <nav className="flex items-center gap-4">
          {/* Tampilkan ikon search di header (desktop) */}
          <Link href="/jelajah" className="relative hidden md:block" aria-label="Jelajah">
            <IconSearch className="h-6 w-6 text-gray-600 hover:text-primary" />
          </Link>
          <Link href="/keranjang" className="relative" aria-label="Keranjang">
            <IconCart className="h-6 w-6 text-gray-600 hover:text-primary" />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </Link>
          <Link href="/akun" className="relative" aria-label="Akun">
            <IconUser className={`h-6 w-6 ${user ? 'text-primary' : 'text-gray-600 hover:text-primary'}`} />
          </Link>
        </nav>
      </div>
    </header>
  );
}

// src/components/BottomNavBar.js
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconHome, IconSearch, IconStore, IconMapPin } from './icons';

const navItems = [
  { href: '/', label: 'Beranda', icon: IconHome },
  { href: '/jelajah', label: 'Jelajah', icon: IconSearch },
  // { href: '/toko', label: 'Toko', icon: IconStore }, // Nonaktifkan, jelajah lebih utama
  // { href: '/wisata', label: 'Wisata', icon: IconMapPin }, // Nonaktifkan, jelajah lebih utama
];

export default function BottomNavBar() {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t bg-background shadow-lg md:hidden">
      <div className="mx-auto flex h-20 max-w-md items-center justify-around px-4">
        {navItems.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 ${
                isActive ? 'text-primary' : 'text-gray-500'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}


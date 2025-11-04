// File: src/components/KategoriGrid.js
// Komponen baru untuk menampilkan "pin kategori" di Halaman Beranda.
import Link from 'next/link';
import { IconStore } from './icons'; // Gunakan ikon placeholder

export default function KategoriGrid({ kategori }) {
  if (!kategori || kategori.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Kategori Populer</h2>
      <div className="grid grid-cols-4 gap-4 md:grid-cols-6 lg:grid-cols-8">
        {kategori.map((kat) => (
          <Link
            key={kat.id}
            href={`/jelajah?kategori=${kat.slug}`}
            className="flex flex-col items-center gap-2 rounded-lg bg-white p-3 text-center shadow-md transition-shadow hover:shadow-lg"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              {/* TODO: Idealnya gunakan ikon dari 'kat.icon' */}
              <IconStore className="h-6 w-6" /> 
            </div>
            <span className="text-xs font-semibold text-gray-700">{kat.nama}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}


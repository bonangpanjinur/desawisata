// src/components/WisataCard.js
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin } from './icons';

const placeholderImg = "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Wisata";

export default function WisataCard({ wisata }) {
  if (!wisata) return null;

  const imageUrl = wisata.gambar_unggulan?.medium || placeholderImg;
  const linkUrl = `/wisata/${wisata.slug}`;

  return (
    <Link href={linkUrl} className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={wisata.nama_wisata || 'Gambar Wisata'}
          layout="fill"
          objectFit="cover"
          onError={(e) => (e.target.src = placeholderImg)}
        />
        {/* Badge Desa (jika ada) */}
        {wisata.nama_desa && (
            <div className="absolute top-2 left-2 rounded-full bg-primary/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {wisata.nama_desa}
            </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-gray-800" title={wisata.nama_wisata}>
          {wisata.nama_wisata}
        </h3>
        
        {/* Info Lokasi */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <IconMapPin className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{wisata.lokasi_singkat || 'Lokasi belum diatur'}</span>
        </div>

        {/* Harga Tiket (Contoh) - Asumsi ada field harga_tiket */}
        <p className="mt-4 text-lg font-bold text-primary">
          {wisata.harga_tiket > 0 ? `Rp ${wisata.harga_tiket.toLocaleString('id-ID')}` : 'Gratis'}
        </p>
      </div>
    </Link>
  );
}

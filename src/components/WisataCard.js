// src/components/WisataCard.js
// PERBAIKAN: Menyesuaikan akses data dengan struktur dari API (api-helpers.php)
// PERBAIKAN: Menambahkan `unoptimized` pada Image untuk mengatasi error 400
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin } from './icons';

const placeholderImg = "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Wisata";

export default function WisataCard({ wisata }) {
  if (!wisata) return null;

  // Menggunakan ukuran medium dari API, fallback ke placeholder jika null
  const imageUrl = wisata.gambar_unggulan?.medium || placeholderImg;
  const linkUrl = `/wisata/${wisata.slug}`;

  const namaDesa = wisata.desa?.nama_desa;
  const lokasiSingkat = wisata.desa?.kabupaten || wisata.lokasi?.alamat || 'Lokasi';
  const hargaTiket = wisata.info?.harga_tiket || 0; 

  return (
    <Link href={linkUrl} className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={wisata.nama_wisata || 'Gambar Wisata'}
          layout="fill"
          objectFit="cover"
          unoptimized={true} // **PENTING: Menambahkan unoptimized untuk menghindari error 400 Next/Image**
          onError={(e) => (e.target.src = placeholderImg)}
        />
        {/* Badge Desa (jika ada) */}
        {namaDesa && (
            <div className="absolute top-2 left-2 rounded-full bg-primary/80 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {namaDesa}
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
          <span className="truncate">{lokasiSingkat}</span>
        </div>

        {/* Harga Tiket */}
        <p className="mt-4 text-lg font-bold text-primary">
          {typeof hargaTiket === 'number' && hargaTiket > 0 
            ? `Rp ${hargaTiket.toLocaleString('id-ID')}`
            : (typeof hargaTiket === 'string' ? hargaTiket : 'Gratis')
          }
        </p>
      </div>
    </Link>
  );
}

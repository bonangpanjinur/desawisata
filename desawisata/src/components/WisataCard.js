// src/components/WisataCard.js
// PERBAIKAN: Menyesuaikan akses data dengan struktur dari API (api-helpers.php)
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin } from './icons';

const placeholderImg = "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Wisata";

export default function WisataCard({ wisata }) {
  if (!wisata) return null;

  const imageUrl = wisata.gambar_unggulan?.medium || placeholderImg;
  const linkUrl = `/wisata/${wisata.slug}`;

  // PERBAIKAN: Akses data yang benar
  const namaDesa = wisata.desa?.nama_desa;
  // Gunakan kabupaten dari desa sebagai lokasi singkat, atau alamat jika ada
  const lokasiSingkat = wisata.desa?.kabupaten || wisata.lokasi?.alamat || 'Lokasi';
  // Harga tiket ada di dalam object `info`
  const hargaTiket = wisata.info?.harga_tiket || 0; 

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
          {/* PERBAIKAN: Tampilkan lokasi singkat yang benar */}
          <span className="truncate">{lokasiSingkat}</span>
        </div>

        {/* Harga Tiket */}
        <p className="mt-4 text-lg font-bold text-primary">
          {/* PERBAIKAN: Cek harga tiket yang benar dan formatnya */}
          {typeof hargaTiket === 'number' && hargaTiket > 0 
            ? `Rp ${hargaTiket.toLocaleString('id-ID')}`
            : (typeof hargaTiket === 'string' ? hargaTiket : 'Gratis')
          }
        </p>
      </div>
    </Link>
  );
}

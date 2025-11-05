// src/components/ProductCard.js
// PERBAIKAN: 
// 1. Mengambil gambar dari galeri jika gambar unggulan tidak ada.
// 2. Menambahkan `unoptimized={true}` pada Next/Image.
// 3. Menggunakan `harga_tampil` dari API.
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin, IconStore } from './icons';
import { formatCurrency } from '@/lib/utils'; 

const placeholderImg = "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Sadesa";

export default function ProductCard({ product }) {
  if (!product) return null;

  // --- PERBAIKAN LOGIKA GAMBAR ---
  const imageUrl = product.gambar_unggulan?.medium 
                   || product.galeri_foto?.[0]?.medium 
                   || placeholderImg;
  // --- AKHIR PERBAIKAN ---
  
  const linkUrl = `/product/${product.slug}`; 
  
  // PERBAIKAN: Gunakan harga_tampil dari API
  let displayPrice = product.harga_tampil;
  let hasVariations = product.variasi && product.variasi.length > 0;

  return (
    <Link href={linkUrl} className="group flex flex-col overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={product.nama_produk || 'Gambar Produk'}
          layout="fill"
          objectFit="cover"
          unoptimized={true} // **PERBAIKAN: Menambahkan unoptimized**
          className="transition-transform duration-300 group-hover:scale-105"
          onError={(e) => (e.target.src = placeholderImg)}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-semibold text-gray-800" title={product.nama_produk}>
          {product.nama_produk}
        </h3>
        
        {product.toko && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <IconStore className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{product.toko.nama_toko}</span>
          </div>
        )}
        {product.toko?.nama_desa && (
           <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <IconMapPin className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{product.toko.nama_desa}</span>
          </div>
        )}

        <div className="mt-auto pt-4">
          <p className="text-lg font-bold text-primary">
            {/* PERBAIKAN: Gunakan formatCurrency */}
            {displayPrice > 0 ? formatCurrency(displayPrice) : 'Gratis'}
            {hasVariations && <span className="text-xs font-normal text-gray-500"> (mulai dari)</span>}
          </p>
        </div>
      </div>
    </Link>
  );
}
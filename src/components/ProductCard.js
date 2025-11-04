// src/components/ProductCard.js
import Link from 'next/link';
import Image from 'next/image';
import { IconMapPin, IconStore } from './icons';

// Placeholder jika gambar tidak ada
const placeholderImg = "https://placehold.co/400x300/f4f4f5/a1a1aa?text=Sadesa";

export default function ProductCard({ product }) {
  if (!product) return null;

  const imageUrl = product.gambar_unggulan?.medium || placeholderImg;
  const linkUrl = `/produk/${product.slug}`;

  // Tentukan harga
  let displayPrice = product.harga_dasar;
  if (product.variasi && product.variasi.length > 0) {
    // Ambil harga terendah dari variasi
    const prices = product.variasi.map(v => v.harga);
    displayPrice = Math.min(...prices);
  }

  return (
    <Link href={linkUrl} className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={product.nama_produk || 'Gambar Produk'}
          layout="fill"
          objectFit="cover"
          onError={(e) => e.target.src = placeholderImg}
        />
      </div>
      <div className="p-4">
        <h3 className="truncate font-semibold text-gray-800" title={product.nama_produk}>
          {product.nama_produk}
        </h3>
        
        {/* Info Toko & Desa */}
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

        {/* Harga */}
        <p className="mt-4 text-lg font-bold text-primary">
          {displayPrice > 0 ? `Rp ${displayPrice.toLocaleString('id-ID')}` : 'Gratis'}
          {product.variasi && product.variasi.length > 0 && <span className="text-xs font-normal text-gray-500"> (mulai dari)</span>}
        </p>
      </div>
    </Link>
  );
}


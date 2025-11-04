// src/pages/produk/[slug].js
import { useState } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { IconMapPin, IconStore, IconPlus, IconMinus, IconCart } from '@/components/icons'; // Impor IconCart
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const placeholderImg = "https://placehold.co/600x400/f4f4f5/a1a1aa?text=Sadesa";

// Fungsi ini berjalan di server
export async function getServerSideProps(context) {
  const { slug } = context.params;
  try {
    const product = await apiFetch(`/produk/slug/${slug}`);
    // Ambil ulasan
    const reviews = await apiFetch(`/reviews/produk/${product.id}`);
    return { props: { product, reviews } };
  } catch (error) {
    console.error("Gagal fetch produk by slug:", error);
    return { notFound: true }; // Tampilkan halaman 404 jika produk tidak ditemukan
  }
}

export default function ProductDetailPage({ product, reviews }) {
  const router = useRouter();
  const { addItem, isLoading: isCartLoading } = useCartStore();
  const [selectedVariation, setSelectedVariation] = useState(
    product.variasi && product.variasi.length > 0 ? product.variasi[0] : null
  );
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);

  if (router.isFallback || !product) {
    return <Layout><LoadingSpinner fullPage /></Layout>;
  }

  const hasVariations = product.variasi && product.variasi.length > 0;
  const displayPrice = selectedVariation ? selectedVariation.harga : product.harga_dasar;
  const imageUrl = product.gambar_unggulan?.large || placeholderImg;

  const handleAddToCart = async () => {
    setMessage(null);
    await addItem(product.id, selectedVariation?.id || 0, quantity);
    setMessage({ type: 'success', text: 'Berhasil ditambahkan ke keranjang!' });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Layout>
      <div className="rounded-lg bg-white p-4 shadow-lg md:p-6">
        {/* Gambar Produk */}
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-gray-100 md:h-96">
          <Image
            src={imageUrl}
            alt={product.nama_produk}
            layout="fill"
            objectFit="cover"
            onError={(e) => (e.target.src = placeholderImg)}
          />
        </div>

        {/* Info Toko */}
        {product.toko && (
          <Link href={`/toko/${product.toko.id_pedagang}`}>
            <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
              <img
                src={'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Toko'} // TODO: Ganti dengan logo toko
                alt={product.toko.nama_toko}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-primary">{product.toko.nama_toko}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <IconMapPin className="h-4 w-4" /> {product.toko.nama_desa}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Info Produk */}
        <h1 className="mb-2 text-3xl font-bold">{product.nama_produk}</h1>
        <p className="mb-4 text-3xl font-bold text-primary">
          Rp {displayPrice.toLocaleString('id-ID')}
        </p>

        {/* Varian */}
        {hasVariations && (
          <div className="mb-4">
            <label className="mb-2 block font-semibold">Pilih Varian:</label>
            <div className="flex flex-wrap gap-2">
              {product.variasi.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors
                    ${selectedVariation?.id === v.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                >
                  {v.deskripsi} (Rp {v.harga.toLocaleString('id-ID')})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Kuantitas */}
        <div className="mb-6 flex items-center gap-4">
          <label className="font-semibold">Jumlah:</label>
          <div className="flex items-center rounded-lg border border-gray-300">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="border-r p-3 text-primary hover:bg-gray-100 disabled:text-gray-300"
              disabled={quantity <= 1}
            >
              <IconMinus className="h-5 w-5" />
            </button>
            <span className="w-12 text-center text-lg font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="border-l p-3 text-primary hover:bg-gray-100"
            >
              <IconPlus className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Tombol Aksi */}
        {message && (
          <div className={`mb-4 rounded-lg p-3 text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message.text}
          </div>
        )}
        <button
          onClick={handleAddToCart}
          disabled={isCartLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-primary py-3 px-6 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <IconCart className="h-6 w-6" />
          {isCartLoading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
        </button>

        {/* Deskripsi */}
        <div className="prose prose-sm mt-8 max-w-none border-t pt-6">
          <h3 className="font-semibold">Deskripsi Produk</h3>
          <div dangerouslySetInnerHTML={{ __html: product.deskripsi || '<p>Tidak ada deskripsi.</p>' }} />
        </div>

        {/* Ulasan */}
        <div className="mt-8 border-t pt-6">
          <h3 className="text-xl font-semibold">Ulasan Pelanggan ({reviews.total})</h3>
          {reviews.reviews.length > 0 ? (
            <div className="mt-4 space-y-4">
              {reviews.reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{review.display_name}</span>
                    <span className="text-sm text-gray-500">{review.tanggal_formatted}</span>
                  </div>
                  <p className="mt-1 text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</p>
                  <p className="mt-2 text-gray-700">{review.komentar}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-gray-500">Belum ada ulasan untuk produk ini.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

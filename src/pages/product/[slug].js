/**
 * LOKASI FILE: src/pages/product/[slug].js
 * PERBAIKAN: 
 * 1. Mengganti 'apiGetProductBySlug' menjadi 'apiGetProdukDetail'.
 * 2. Mengganti 'apiGetReviews' (yang hilang) dengan impor yang benar.
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { apiGetProdukDetail, apiGetReviews } from '@/lib/api'; // PERBAIKAN NAMA FUNGSI
import Layout from '@/components/Layout';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore'; // Impor bernama
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Star } from 'lucide-react';

export default function ProductDetail({ product, reviews }) {
  const router = useRouter();
  const { addItem } = useCartStore(); // Impor bernama
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false); // State loading untuk tombol

  if (router.isFallback) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return <Layout><p>Produk tidak ditemukan.</p></Layout>;
  }

  const hasVariations = product.variasi && product.variasi.length > 0;
  const mainImage = product.gambar_unggulan?.large || product.galeri_foto?.[0]?.large || '/placeholder-large.png';

  const handleAddToCart = () => {
    if (loading) return; // Cegah klik ganda

    // Validasi: Wajib pilih variasi jika ada
    if (hasVariations && !selectedVariation) {
      toast.error('Silakan pilih variasi terlebih dahulu.');
      return;
    }

    setLoading(true);
    toast.loading('Menambahkan ke keranjang...');

    // Tentukan variasi yang akan dikirim ke store
    const variationToAdd = hasVariations ? selectedVariation : null;

    // Logika penambahan item (dari store)
    addItem(product, variationToAdd, quantity);

    setLoading(false);
    toast.dismiss();
    toast.success(`${product.nama_produk} berhasil ditambahkan!`);

    // Reset quantity
    setQuantity(1);
    setSelectedVariation(null);
  };

  const handleVariationChange = (e) => {
    const variationId = e.target.value;
    const variation = product.variasi.find(v => v.id == variationId);
    setSelectedVariation(variation);
  };

  const getPrice = () => {
    if (selectedVariation) {
      return selectedVariation.harga_variasi;
    }
    if (hasVariations) {
      return null; // Tampilkan rentang harga atau teks "Pilih variasi"
    }
    return product.harga_dasar;
  };

  const displayPrice = getPrice();

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Kolom Gambar */}
            <div className="md:w-1/2">
              <img src={mainImage} alt={product.nama_produk} className="w-full h-64 md:h-full object-cover" />
              {/* TODO: Galeri foto thumbnail */}
            </div>

            {/* Kolom Info */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <a onClick={() => router.push(`/toko/${product.toko.id_pedagang}`)} className="text-sm text-blue-600 hover:underline cursor-pointer">{product.toko.nama_toko}</a>
                <h1 className="text-3xl font-bold mt-1 mb-2">{product.nama_produk}</h1>
                
                <div className="flex items-center mb-4">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="ml-1 font-semibold">{product.rating.average}</span>
                  <span className="ml-2 text-gray-500">({product.rating.count} ulasan)</span>
                </div>
                
                {/* Harga */}
                <div className="text-3xl font-bold text-green-600 mb-4">
                  {displayPrice !== null ? (
                    `Rp ${formatCurrency(displayPrice)}`
                  ) : (
                    <span className="text-xl">Pilih variasi untuk harga</span>
                  )}
                </div>

                {/* Variasi */}
                {hasVariations && (
                  <div className="mb-4">
                    <label htmlFor="variation" className="block text-sm font-medium text-gray-700 mb-1">Pilih Variasi:</label>
                    <select
                      id="variation"
                      value={selectedVariation?.id || ''}
                      onChange={handleVariationChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">-- Pilih --</option>
                      {product.variasi.map(v => (
                        <option key={v.id} value={v.id}>
                          {v.deskripsi} (Rp {formatCurrency(v.harga_variasi)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Kuantitas */}
                <div className="mb-4">
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Kuantitas:</label>
                  <input
                    type="number"
                    id="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
                    min="1"
                    className="w-20 p-2 border rounded-md"
                  />
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={loading || (hasVariations && !selectedVariation)}
                  className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner /> Menambahkan...
                    </span>
                  ) : "Tambah ke Keranjang"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Deskripsi & Ulasan */}
        <div className="bg-white rounded-lg shadow-lg mt-6 p-6">
          <h2 className="text-2xl font-semibold mb-4">Deskripsi Produk</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: product.deskripsi || '<p>Tidak ada deskripsi.</p>' }}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-lg mt-6 p-6">
          <h2 className="text-2xl font-semibold mb-4">Ulasan Pembeli ({reviews?.total || 0})</h2>
          <div className="space-y-4">
            {reviews && reviews.reviews.length > 0 ? (
              reviews.reviews.map(review => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center mb-1">
                    <span className="font-semibold">{review.display_name}</span>
                    <div className="flex ml-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600">{review.komentar}</p>
                  <p className="text-xs text-gray-400 mt-1">{review.tanggal_formatted}</p>
                </div>
              ))
            ) : (
              <p>Belum ada ulasan untuk produk ini.</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Fungsi GetStaticPaths dan GetStaticProps
export async function getStaticPaths() {
  let products = [];
  try {
    const data = await apiGetProduk({ per_page: 20 }); // Ambil 20 produk terbaru untuk paths
    products = data.data;
  } catch (error) {
    console.error("Gagal fetch paths produk:", error);
  }
  
  const paths = products.map(product => ({
    params: { slug: product.slug },
  }));

  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  try {
    const product = await apiGetProdukDetail(params.slug); // PERBAIKAN NAMA FUNGSI
    let reviews = null;
    try {
      reviews = await apiGetReviews('produk', product.id, { per_page: 5 }); // Ambil 5 ulasan
    } catch (reviewError) {
      console.error("Gagal fetch review:", reviewError.message);
      // Tetap lanjutkan meski review gagal
    }

    return {
      props: {
        product: product || null,
        reviews: reviews || null,
      },
      revalidate: 60, // Revalidasi setiap 60 detik
    };
  } catch (error) {
    console.error(`Gagal fetch data produk ${params.slug}:`, error.message);
    return {
      notFound: true,
      revalidate: 10,
    };
  }
}


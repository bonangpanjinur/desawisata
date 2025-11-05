/**
 * LOKASI FILE: src/pages/product/[slug].js
 * PERBAIKAN: 
 * 1. Menambahkan 'apiGetProduk' ke dalam import dari '@/lib/api'
 * untuk memperbaiki error 'apiGetProduk is not defined' di getStaticPaths.
 * 2. Menambahkan unoptimized={true} pada Image
 */
import { useState } from 'react';
import { useRouter } from 'next/router';
// PERBAIKAN: Tambahkan 'apiGetProduk'
import { apiGetProdukDetail, apiGetReviews, apiGetProduk } from '@/lib/api'; 
import Layout from '@/components/Layout';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore'; // Impor bernama
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Star, ShoppingCart } from 'lucide-react';
import Image from 'next/image'; // Impor Next Image

export default function ProductDetail({ product, reviews }) {
  const router = useRouter();
  const { addItem } = useCartStore(); 
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false); 

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
  const mainImage = product.gambar_unggulan?.large || product.galeri_foto?.[0]?.large || 'https://placehold.co/600x600/f4f4f5/a1a1aa?text=Produk';
  const placeholderImg = 'https://placehold.co/600x600/f4f4f5/a1a1aa?text=Produk';

  const handleAddToCart = () => {
    if (loading) return; 

    if (hasVariations && !selectedVariation) {
      toast.error('Silakan pilih variasi terlebih dahulu.');
      return;
    }

    setLoading(true);
    toast.loading('Menambahkan ke keranjang...');

    const variationToAdd = hasVariations ? selectedVariation : null;

    addItem(product, variationToAdd, quantity);

    setLoading(false);
    toast.dismiss();
    toast.success(`${product.nama_produk} berhasil ditambahkan!`);

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
      const minPrice = Math.min(...product.variasi.map(v => v.harga_variasi));
      return minPrice;
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
            <div className="md:w-1/2 relative h-64 md:h-[450px] bg-gray-100">
              <Image 
                src={mainImage} 
                alt={product.nama_produk} 
                layout="fill"
                objectFit="cover"
                unoptimized={true} // PERBAIKAN
                onError={(e) => (e.target.src = placeholderImg)}
              />
            </div>

            {/* Kolom Info */}
            <div className="md:w-1/2 p-6 flex flex-col justify-between">
              <div>
                <span onClick={() => router.push(`/toko/${product.toko.id_pedagang}`)} className="text-sm text-primary hover:underline cursor-pointer">{product.toko.nama_toko}</span>
                <h1 className="text-3xl font-bold mt-1 mb-2">{product.nama_produk}</h1>
                
                <div className="flex items-center mb-4">
                  <Star className="text-yellow-400 fill-yellow-400" size={20} />
                  <span className="ml-1 font-semibold">{product.rating.average}</span>
                  <span className="ml-2 text-gray-500">({product.rating.count} ulasan)</span>
                </div>
                
                <div className="text-3xl font-bold text-primary mb-4">
                  {displayPrice !== null ? (
                    <>
                      {hasVariations && !selectedVariation && <span className="text-lg text-gray-500 font-normal">Mulai </span>}
                      {formatCurrency(displayPrice)}
                    </>
                  ) : (
                    <span className="text-xl">Pilih variasi untuk harga</span>
                  )}
                </div>

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
                          {v.deskripsi} ({formatCurrency(v.harga_variasi)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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

              <div className="mt-6">
                <button
                  onClick={handleAddToCart}
                  disabled={loading || (hasVariations && !selectedVariation)}
                  className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <LoadingSpinner /> 
                  ) : <ShoppingCart size={20} />}
                  {loading ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>
        </div>

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

export async function getStaticPaths() {
  let products = [];
  try {
    // PERBAIKAN: apiGetProduk sekarang sudah diimpor
    const data = await apiGetProduk({ per_page: 20 }); 
    products = data.data || [];
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
    const product = await apiGetProdukDetail(params.slug); 
    let reviews = null;
    try {
      reviews = await apiGetReviews('produk', product.id, { per_page: 5 }); 
    } catch (reviewError) {
      console.error("Gagal fetch review:", reviewError.message);
    }

    return {
      props: {
        product: product || null,
        reviews: reviews || null,
      },
      revalidate: 60, 
    };
  } catch (error) {
    console.error(`Gagal fetch data produk ${params.slug}:`, error.message);
    return {
      notFound: true,
      revalidate: 10,
    };
  }
}
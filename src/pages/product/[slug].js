// src/pages/product/[slug].js
// PERBAIKAN: Menambahkan feedback 'toast' dan validasi
// saat menambah barang ke keranjang.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiGetProductBySlug, apiGetReviews } from '@/lib/api';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatCurrency } from '@/lib/utils';
import { Star } from 'lucide-react';
import useCartStore from '@/store/cartStore';
import { toast } from 'react-hot-toast'; // 1. Impor toast

// Komponen Rating Bintang (helper)
const RatingStars = ({ rating, reviewCount }) => {
// ... (fungsi ini tetap sama)
// ...
  const stars = [];
// ...
  return (
    <div className="flex items-center">
      {stars}
      <span className="text-sm text-gray-500 ml-2">({reviewCount} ulasan)</span>
    </div>
  );
};

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState(null);

  // 2. Tambahkan state loading untuk tombol
  const [loadingCart, setLoadingCart] = useState(false);

  const { addToCart } = useCartStore();

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const productData = await apiGetProductBySlug(slug);
          setProduct(productData);
          
          if (productData.variasi && productData.variasi.length > 0) {
            // Opsional: set variasi default jika ada
            // setSelectedVariation(productData.variasi[0]);
          }

          // Ambil ulasan
          const reviewData = await apiGetReviews('produk', productData.id);
          setReviews(reviewData.reviews || []);

        } catch (error) {
          console.error('Gagal mengambil detail produk:', error);
          toast.error('Gagal memuat produk.');
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [slug]);

  // 3. Perbarui fungsi handleAddToCart
  const handleAddToCart = () => {
    if (loadingCart) return; // Cegah klik ganda

    // 4. Tambahkan validasi variasi
    if (product.variasi && product.variasi.length > 0 && !selectedVariation) {
      toast.error('Silakan pilih variasi (ukuran/tipe) terlebih dahulu.');
      return;
    }

    setLoadingCart(true); // Set loading

    try {
      // Panggil fungsi add to cart dari store
      addToCart(product, selectedVariation, quantity);

      // 5. Tampilkan notifikasi sukses
      const itemName = selectedVariation 
        ? `${product.nama_produk} (${selectedVariation.deskripsi_variasi})` // Gunakan nama field yang benar
        : product.nama_produk;
      
      toast.success(`${itemName} (x${quantity}) berhasil ditambahkan ke keranjang!`);
      
      // Reset (Opsional)
      // setQuantity(1);
      // setSelectedVariation(null);

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Gagal menambahkan ke keranjang.');
    } finally {
      setLoadingCart(false); // Selesai loading
    }
  };

  const handleQuantityChange = (amount) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };
  
  const handleVariationChange = (e) => {
    const variationId = parseInt(e.target.value, 10);
    const variation = product.variasi.find(v => v.id === variationId);
    setSelectedVariation(variation);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto p-4 text-center">
          <h1 className="text-2xl font-bold">Produk tidak ditemukan.</h1>
        </div>
      </Layout>
    );
  }

  // Tentukan harga yang ditampilkan
  const displayPrice = selectedVariation
    ? selectedVariation.harga_variasi
    : (product.harga_dasar || 0);

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Kolom Gambar */}
          <div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-24">
              <img
                src={product.gambar_unggulan?.large || product.galeri_foto?.[0]?.large || "https://placehold.co/600x600/f4f4f5/a1a1aa?text=Sadesa"}
                alt={product.nama_produk}
                className="w-full h-96 object-cover"
              />
              {/* TODO: Tambahkan thumbnail galeri di sini jika 'product.galeri_foto' punya > 1 gambar */}
            </div>
          </div>

          {/* Kolom Detail */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold mb-3">{product.nama_produk}</h1>
              <div className="mb-4">
                <RatingStars rating={product.rating?.average || 0} reviewCount={product.rating?.count || 0} />
              </div>
              <p className="text-3xl font-bold text-green-600 mb-4">
                Rp {formatCurrency(displayPrice)}
              </p>
              
              {/* Info Toko */}
              {product.toko && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-600">Dijual oleh:</p>
                  <a href={`/toko/${product.toko.id_pedagang}`} className="font-semibold text-green-700 hover:underline">
                    {product.toko.nama_toko}
                  </a>
                  <p className="text-sm text-gray-500">{product.toko.nama_desa}</p>
                </div>
              )}

              {/* Pilihan Variasi */}
              {product.variasi && product.variasi.length > 0 && (
                <div className="mb-4">
                  <label htmlFor="variasi" className="block text-sm font-medium text-gray-700 mb-2">Pilih Variasi:</label>
                  <select
                    id="variasi"
                    name="variasi"
                    value={selectedVariation?.id || ''}
                    onChange={handleVariationChange}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="" disabled>-- Pilih Opsi --</option>
                    {product.variasi.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.deskripsi_variasi} (Rp {formatCurrency(v.harga_variasi)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pilihan Kuantitas */}
              <div className="mb-6">
                <label htmlFor="kuantitas" className="block text-sm font-medium text-gray-700 mb-2">Kuantitas:</label>
                <div className="flex items-center">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 border rounded-l-lg hover:bg-gray-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="kuantitas"
                    name="kuantitas"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-t border-b"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 border rounded-r-lg hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Tombol Add to Cart */}
              <button
                onClick={handleAddToCart}
                // 6. Update tombol disabled dan teks
                disabled={loadingCart}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
              >
                {loadingCart ? 'Menambahkan...' : 'Tambah ke Keranjang'}
              </button>
            </div>

            {/* Deskripsi Produk */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-3">Deskripsi Produk</h2>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: product.deskripsi || '<p>Tidak ada deskripsi.</p>' }}
              />
            </div>

            {/* Ulasan */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-6">
              <h2 className="text-xl font-semibold mb-4">Ulasan Pembeli ({reviews.length})</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map(review => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{review.display_name}</span>
                        <span className="text-sm text-gray-500">{review.tanggal_formatted}</span>
                      </div>
                      <RatingStars rating={review.rating} reviewCount={0} />
                      <p className="text-gray-700 mt-2">{review.komentar}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Belum ada ulasan untuk produk ini.</p>
              )}
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

// Fungsi getServerSideProps (tetap sama)
export async function getServerSideProps(context) {
// ...
  const { slug } = context.params;
  try {
    const productData = await apiGetProductBySlug(slug);
    return {
      props: {
        initialProduct: productData,
      },
    };
  } catch (error) {
    console.error('GSS Error:', error);
    return {
      notFound: true,
    };
  }
}

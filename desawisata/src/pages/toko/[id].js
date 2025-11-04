// src/pages/toko/[id].js
// Ini adalah Halaman Profil Toko yang dinamis
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductCard from '@/components/ProductCard';
import StorePWAInstall from '@/components/StorePWA'; // Komponen PWA
import { apiFetch } from '@/lib/api';
import { IconMapPin, IconInfo } from '@/components/icons';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const data = await apiFetch(`/toko/${id}`);
    return { props: { toko: data.toko, initialProducts: data.produk.data } };
  } catch (error) {
    console.error("Gagal fetch data toko:", error);
    return { notFound: true };
  }
}

export default function TokoDetailPage({ toko, initialProducts }) {
  const router = useRouter();
  
  if (router.isFallback || !toko) {
    return <Layout><LoadingSpinner fullPage /></Layout>;
  }

  // TODO: Implementasi 'load more' untuk produk

  return (
    <Layout>
      {/* Header Toko */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="h-32 bg-gray-200 md:h-48">
          {/* TODO: Ganti dengan Banner Toko jika ada */}
          <img
            src="https://placehold.co/1000x300/e2e8f0/a1a1aa?text=Banner+Toko"
            alt="Banner Toko"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="relative -mt-16 flex items-end gap-4">
            <img
              src={'https://placehold.co/150x150/e2e8f0/a1a1aa?text=Logo'} // TODO: Ganti dengan logo toko
              alt={toko.nama_toko}
              className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 object-cover shadow-md"
            />
            <div>
              <h1 className="text-2xl font-bold">{toko.nama_toko}</h1>
              <p className="flex items-center gap-1 text-gray-600">
                <IconMapPin className="h-4 w-4" /> {toko.nama_desa}
              </p>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-gray-700">{toko.deskripsi_toko || "Toko ini belum memiliki deskripsi."}</p>
          
          {/* Tombol Install PWA Dinamis */}
          <StorePWAInstall tokoId={toko.id} tokoName={toko.nama_toko} />
        </div>
      </div>

      {/* Produk Toko */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Produk dari {toko.nama_toko}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {initialProducts.length > 0 ? (
            initialProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Toko ini belum memiliki produk.
            </p>
          )}
        </div>
        {/* TODO: Tambahkan tombol Load More di sini */}
      </section>
    </Layout>
  );
}


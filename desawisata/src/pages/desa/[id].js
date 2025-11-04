// src/pages/desa/[id].js
// PERBAIKAN: Mengganti `desa.banner` menjadi `desa.foto` sebagai fallback
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ProductCard from '@/components/ProductCard';
import WisataCard from '@/components/WisataCard'; // Gunakan WisataCard baru
import { apiFetch } from '@/lib/api';
import { IconMapPin } from '@/components/icons';
import { useRouter } from 'next/router';

export async function getServerSideProps(context) {
  const { id } = context.params;
  try {
    const data = await apiFetch(`/desa/${id}`);
    
    return { 
      props: { 
        desa: data.desa, 
        products: data.produk.data || [],
        wisata: data.wisata.data || []
      } 
    };
  } catch (error) {
    console.error("Gagal fetch data desa:", error);
    return { notFound: true };
  }
}

export default function DesaDetailPage({ desa, products, wisata }) {
  const router = useRouter();
  
  if (router.isFallback || !desa) {
    return <Layout><LoadingSpinner fullPage /></Layout>;
  }

  // PERBAIKAN: Gunakan desa.foto karena desa.banner tidak ada di API
  const bannerUrl = desa.foto || "https://placehold.co/1000x300/e2e8f0/a1a1aa?text=Banner+Desa";

  return (
    <Layout>
      {/* Header Desa */}
      <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="h-32 bg-gray-200 md:h-48">
          <img
            src={bannerUrl}
            alt={`Banner ${desa.nama_desa}`}
            className="h-full w-full object-cover"
            onError={(e) => (e.target.src = "https://placehold.co/1000x300/e2e8f0/a1a1aa?text=Banner+Desa")}
          />
        </div>
        <div className="p-4">
          <div className="relative -mt-16 flex items-end gap-4">
            <img
              src={desa.foto || 'https://placehold.co/150x150/e2e8f0/a1a1aa?text=Logo'}
              alt={desa.nama_desa}
              className="h-24 w-24 rounded-full border-4 border-white bg-gray-200 object-cover shadow-md"
              onError={(e) => (e.target.src = 'https://placehold.co/150x150/e2e8f0/a1a1aa?text=Logo')}
            />
            <div>
              <h1 className="text-2xl font-bold">{desa.nama_desa}</h1>
              <p className="flex items-center gap-1 text-gray-600">
                <IconMapPin className="h-4 w-4" /> {desa.kabupaten}, {desa.provinsi}
              </p>
            </div>
          </div>
          
          <p className="prose prose-sm mt-4 text-gray-700">{desa.deskripsi || "Desa ini belum memiliki deskripsi."}</p>
        </div>
      </div>

      {/* Wisata Unggulan Desa */}
      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Wisata di {desa.nama_desa}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {wisata.length > 0 ? (
            wisata.map(w => (
              <WisataCard key={w.id} wisata={w} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Belum ada data wisata untuk desa ini.
            </p>
          )}
        </div>
      </section>

      {/* Produk Unggulan Desa */}
      <section>
        <h2 className="mb-4 text-xl font-bold">Produk dari {desa.nama_desa}</h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Belum ada data produk untuk desa ini.
            </p>
          )}
        </div>
      </section>
    </Layout>
  );
}

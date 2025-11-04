// src/pages/index.js (Halaman Beranda)
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { IconArrowUpRight, IconMapPin, IconStore } from '@/components/icons';

// Fungsi ini berjalan di server saat halaman diminta
export async function getServerSideProps() {
  try {
    // Ambil data secara paralel
    const [banners, featuredProducts, desa] = await Promise.all([
      apiFetch('/banner'),
      apiFetch('/produk?unggulan=true&per_page=6'),
      apiFetch('/desa?per_page=6')
    ]);

    return {
      props: {
        banners: banners || [],
        featuredProducts: featuredProducts.data || [],
        desa: desa.data || [],
      },
    };
  } catch (error) {
    console.error("Gagal fetch data beranda:", error);
    return { props: { banners: [], featuredProducts: [], desa: [] } };
  }
}

export default function HomePage({ banners, featuredProducts, desa }) {
  return (
    <Layout>
      {/* Bagian Banner/Hero */}
      {banners.length > 0 && (
        <div className="mb-8 h-48 w-full overflow-hidden rounded-lg bg-gray-200 shadow-lg md:h-64">
          <Link href={banners[0].link || '/jelajah'}>
            <img
              src={banners[0].gambar}
              alt={banners[0].judul}
              className="h-full w-full object-cover"
              onError={(e) => e.target.src = 'https://placehold.co/1200x400/e2e8f0/a1a1aa?text=Sadesa'}
            />
          </Link>
        </div>
      )}
      
      {/* Bagian Produk Unggulan */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Produk Unggulan</h2>
          <Link href="/jelajah" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            Lihat Semua <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-gray-500">Belum ada produk unggulan.</p>
          )}
        </div>
      </section>

      {/* Bagian Desa */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Jelajahi Desa</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {desa.length > 0 ? (
            desa.map(d => (
              <div key={d.id} className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-md">
                <img
                  src={d.foto || 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa'}
                  alt={d.nama_desa}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                />
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate font-semibold">{d.nama_desa}</h3>
                  <p className="mt-1 truncate text-sm text-gray-500">{d.kabupaten}</p>
                  {/* TODO: Tambahkan link ke halaman detail desa jika ada */}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">Belum ada desa yang terdaftar.</p>
          )}
        </div>
      </section>

    </Layout>
  );
}


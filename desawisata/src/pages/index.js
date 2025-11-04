// File: src/pages/index.js
// PERBAIKAN: Menghapus search bar dari halaman utama
import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import WisataCard from '@/components/WisataCard';
import BannerCarousel from '@/components/BannerCarousel';
import KategoriGrid from '@/components/KategoriGrid';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { IconArrowUpRight, IconMapPin, IconStore, IconSearch } from '@/components/icons';

// Fungsi ini berjalan di server saat halaman diminta
export async function getServerSideProps() {
  try {
    // Ambil data secara paralel
    const [banners, featuredProducts, featuredWisata, desa, kategori] = await Promise.all([
      apiFetch('/banner'),
      apiFetch('/produk?unggulan=true&per_page=6'),
      apiFetch('/wisata?unggulan=true&per_page=6'),
      apiFetch('/desa?per_page=6'),
      apiFetch('/kategori/produk?per_page=8'), // Ambil 8 kategori populer
    ]);

    return {
      props: {
        banners: banners || [],
        featuredProducts: featuredProducts.data || [],
        featuredWisata: featuredWisata.data || [],
        desa: desa.data || [],
        kategori: kategori || [],
      },
    };
  } catch (error) {
    console.error("Gagal fetch data beranda:", error);
    return { props: { banners: [], featuredProducts: [], featuredWisata: [], desa: [], kategori: [] } };
  }
}

export default function HomePage({ banners, featuredProducts, featuredWisata, desa, kategori }) {
  const router = useRouter();
  // const [searchTerm, setSearchTerm] = useState(''); // Dihapus

  // const handleSearchSubmit = (e) => { // Dihapus
  //   e.preventDefault();
  //   if (searchTerm.trim()) {
  //     router.push(`/jelajah?q=${searchTerm.trim()}`);
  //   }
  // };

  return (
    <Layout>
      {/* Bagian Banner/Hero - Ganti dengan Carousel */}
      <BannerCarousel banners={banners} />

      {/* Search Bar (DIHAPUS) */}
      {/* <form onSubmit={handleSearchSubmit} className="mb-8">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk, wisata, atau desa..."
            className="w-full rounded-full border border-gray-300 py-3 pl-12 pr-4 text-base shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
            <IconSearch className="h-6 w-6" />
          </button>
        </div>
      </form>
      */}

      {/* Kategori (BARU) */}
      <KategoriGrid kategori={kategori} />
      
      {/* Bagian Wisata Unggulan */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold">Wisata Unggulan</h2>
          <Link href="/jelajah?tipe=wisata" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
            Lihat Semua <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {featuredWisata.length > 0 ? (
            featuredWisata.map(wisata => (
              <WisataCard key={wisata.id} wisata={wisata} />
            ))
          ) : (
            <p className="col-span-full text-gray-500">Belum ada wisata unggulan.</p>
          )}
        </div>
      </section>

      {/* Bagian Produk Unggulan */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold">Produk Unggulan</h2>
          <Link href="/jelajah?tipe=produk" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
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
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold">Jelajahi Desa</h2>
            <Link href="/desa" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
              Lihat Semua <IconArrowUpRight className="h-4 w-4" />
            </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {desa.length > 0 ? (
            desa.map(d => (
              <Link key={d.id} href={`/desa/${d.id}`}>
                <div className="flex cursor-pointer items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
                  <img
                    src={d.foto || 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa'}
                    alt={d.nama_desa}
                    className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate font-semibold">{d.nama_desa}</h3>
                    <p className="mt-1 truncate text-sm text-gray-500">{d.kabupaten}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-500">Belum ada desa yang terdaftar.</p>
          )}
        </div>
      </section>

    </Layout>
  );
}

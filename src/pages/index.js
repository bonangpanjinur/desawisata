// File: src/pages/index.js
// PERBAIKAN: Mengganti filter "unggulan=true" menjadi mengambil data terbaru.
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
    // --- PERBAIKAN: Hapus ?unggulan=true untuk mengambil data terbaru ---
    const [banners, products, wisata, desa, kategori] = await Promise.all([
      apiFetch('/banner'),
      apiFetch('/produk?per_page=6'), // Mengambil 6 produk terbaru
      apiFetch('/wisata?per_page=6'), // Mengambil 6 wisata terbaru
      apiFetch('/desa?per_page=6'),
      apiFetch('/kategori/produk?per_page=8'), // Ambil 8 kategori populer
    ]);
    // --- AKHIR PERBAIKAN ---

    return {
      props: {
        // PERBAIKAN: Memastikan data yang dikirim adalah array yang benar
        banners: banners || [],
        featuredProducts: products.data || [], // Tetap gunakan nama prop `featuredProducts`
        featuredWisata: wisata.data || [], // Tetap gunakan nama prop `featuredWisata`
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

  return (
    <Layout>
      {/* Bagian Banner/Hero - Ganti dengan Carousel */}
      <BannerCarousel banners={banners} />

      {/* Kategori (BARU) */}
      <KategoriGrid kategori={kategori} />
      
      {/* Bagian Wisata Unggulan */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          {/* Judul diubah dari "Unggulan" menjadi "Terbaru" */}
          <h2 className="text-2xl font-bold">Wisata Terbaru</h2>
          <Link href="/jelajah?tipe=wisata" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
            Lihat Semua <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* FOKUS: Memastikan data muncul di sini */}
          {featuredWisata.length > 0 ? (
            featuredWisata.map(wisata => (
              <WisataCard key={wisata.id} wisata={wisata} />
            ))
          ) : (
            // PERBAIKAN: Tampilkan pesan jika data kosong
            <p className="col-span-full text-gray-500">Belum ada wisata terbaru.</p>
          )}
        </div>
      </section>

      {/* Bagian Produk Unggulan */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          {/* Judul diubah dari "Unggulan" menjadi "Terbaru" */}
          <h2 className="text-2xl font-bold">Produk Terbaru</h2>
          <Link href="/jelajah?tipe=produk" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
            Lihat Semua <IconArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {/* FOKUS: Memastikan data muncul di sini */}
          {featuredProducts.length > 0 ? (
            featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // PERBAIKAN: Tampilkan pesan jika data kosong
            <p className="col-span-full text-gray-500">Belum ada produk terbaru.</p>
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

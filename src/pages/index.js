// File: src/pages/index.js
// PERBAIKAN: Menghapus bagian "Jelajahi Desa" sesuai permintaan.
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
    // --- PERBAIKAN: Menghapus fetch data "/desa" ---
    const [banners, products, wisata, kategori] = await Promise.all([
      apiFetch('/banner'),
      apiFetch('/produk?per_page=6'), // Mengambil 6 produk terbaru
      apiFetch('/wisata?per_page=6'), // Mengambil 6 wisata terbaru
      apiFetch('/kategori/produk?per_page=8'), // Ambil 8 kategori populer
    ]);
    // --- AKHIR PERBAIKAN ---

    return {
      props: {
        // PERBAIKAN: Memastikan data yang dikirim adalah array yang benar
        banners: banners || [],
        featuredProducts: products.data || [], // Tetap gunakan nama prop `featuredProducts`
        featuredWisata: wisata.data || [], // Tetap gunakan nama prop `featuredWisata`
        kategori: kategori || [],
        // --- PERBAIKAN: Hapus 'desa' dari props ---
      },
    };
  } catch (error) {
    console.error("Gagal fetch data beranda:", error);
    // --- PERBAIKAN: Hapus 'desa' dari props error ---
    return { props: { banners: [], featuredProducts: [], featuredWisata: [], kategori: [] } };
  }
}

export default function HomePage({ banners, featuredProducts, featuredWisata, kategori }) {
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

      {/* --- PERBAIKAN: Bagian Desa Dihapus --- */}
      {/* <section>
        <div className="mb-4 flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold">Jelajahi Desa</h2>
            <Link href="/desa" className="flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-dark">
              Lihat Semua <IconArrowUpRight className="h-4 w-4" />
            </Link>
        </div>
        ... (konten desa dihapus) ...
      </section>
      */}

    </Layout>
  );
}
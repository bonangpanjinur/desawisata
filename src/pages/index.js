// File: src/pages/index.js
// PERBAIKAN: Memastikan data yang diterima dari getServerSideProps
// di-passing dengan benar dan ditampilkan.
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
    const [bannersRes, productsRes, wisataRes, kategoriRes] = await Promise.all([
      apiFetch('/banner').catch(e => { console.error("Gagal fetch /banner:", e.message); return []; }),
      apiFetch('/produk?per_page=6').catch(e => { console.error("Gagal fetch /produk:", e.message); return { data: [] }; }),
      apiFetch('/wisata?per_page=6').catch(e => { console.error("Gagal fetch /wisata:", e.message); return { data: [] }; }),
      apiFetch('/kategori/produk?per_page=8').catch(e => { console.error("Gagal fetch /kategori/produk:", e.message); return []; }),
    ]);

    return {
      props: {
        // PERBAIKAN: Memastikan data yang dikirim adalah array yang benar
        banners: bannersRes || [],
        featuredProducts: productsRes.data || [], // Ambil .data
        featuredWisata: wisataRes.data || [], // Ambil .data
        kategori: kategoriRes || [],
      },
    };
  } catch (error) {
    console.error("Error global di getServerSideProps:", error);
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
            <p className="col-span-full text-gray-500">Belum ada wisata terbaru.</p>
          )}
        </div>
      </section>

      {/* Bagian Produk Unggulan */}
      <section className="mb-10">
        <div className="mb-4 flex items-center justify-between border-b pb-2">
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
            <p className="col-span-full text-gray-500">Belum ada produk terbaru.</p>
          )}
        </div>
      </section>

    </Layout>
  );
}
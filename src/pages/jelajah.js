// File: src/pages/jelajah.js
// PERBAIKAN: Memperbaiki pengambilan data kategori di getServerSideProps
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import WisataCard from '@/components/WisataCard'; // Impor WisataCard
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import { IconSearch, IconX, IconFilter, IconChevronDown } from '@/components/icons';

// Helper debounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export async function getServerSideProps() {
  // Ambil data filter (kategori & desa) dari server
  try {
    const [kategoriProdukData, desaData, kategoriWisataData] = await Promise.all([
      apiFetch('/kategori/produk'),
      apiFetch('/desa?per_page=100'), // Ambil daftar desa untuk filter
      apiFetch('/kategori/wisata'), // Ambil kategori wisata
    ]);
    return {
      props: {
        // PERBAIKAN: Endpoint kategori mengembalikan array langsung
        filterKategoriProduk: kategoriProdukData || [],
        filterKategoriWisata: kategoriWisataData || [],
        filterDesa: desaData.data || [], // Endpoint desa memang dibungkus 'data'
      },
    };
  } catch (error) {
    console.error("Gagal fetch data filter:", error);
    return { props: { filterKategoriProduk: [], filterKategoriWisata: [], filterDesa: [] } };
  }
}

export default function JelajahPage({ filterKategoriProduk, filterKategoriWisata, filterDesa }) {
  const router = useRouter();
  
  const [tipe, setTipe] = useState(router.query.tipe || 'produk'); 
  const [searchTerm, setSearchTerm] = useState(router.query.q || '');
  const [kategori, setKategori] = useState(router.query.kategori || '');
  const [desa, setDesa] = useState(router.query.desa || '');

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const kategoriList = tipe === 'produk' ? filterKategoriProduk : filterKategoriWisata;

  useEffect(() => {
    // Reset kategori jika tipe berubah
    setKategori('');
  }, [tipe]);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const endpoint = tipe === 'produk' ? '/produk' : '/wisata';
        const params = new URLSearchParams();
        
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }
        if (kategori) {
          params.append('kategori', kategori);
        }
        if (desa) {
          params.append('desa', desa);
        }
        
        const data = await apiFetch(`${endpoint}?${params.toString()}`);
        setResults(data.data || []);
      } catch (error) {
        console.error(`Gagal fetch ${tipe}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm, kategori, desa, tipe]);

  // Update URL saat filter atau search berubah
  useEffect(() => {
    const params = new URLSearchParams();
    if (tipe) params.set('tipe', tipe);
    if (searchTerm) params.set('q', searchTerm);
    if (kategori) params.set('kategori', kategori);
    if (desa) params.set('desa', desa);

    router.push(`/jelajah?${params.toString()}`, undefined, { shallow: true });
  }, [searchTerm, kategori, desa, tipe, router]);

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Jelajah</h1>
      </div>

      {/* Search Bar & Tipe */}
      <div className="sticky top-16 z-30 mb-6 bg-background/80 py-4 backdrop-blur-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={`Cari ${tipe === 'produk' ? 'produk' : 'wisata'}...`}
            className="w-full rounded-full border border-gray-300 py-3 pl-12 pr-10 text-lg shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <IconSearch className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-500"
            >
              <IconX className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Toggler Tipe (Produk/Wisata) */}
        <div className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
          <button
            onClick={() => setTipe('produk')}
            className={`rounded-md py-2 text-center font-semibold ${tipe === 'produk' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
          >
            Produk
          </button>
          <button
            onClick={() => setTipe('wisata')}
            className={`rounded-md py-2 text-center font-semibold ${tipe === 'wisata' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
          >
            Wisata
          </button>
        </div>
        
        {/* Filter (BARU) */}
        <div className="mt-4 flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 px-4 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map(kat => (
                <option key={kat.id} value={kat.slug}>{kat.nama}</option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>

          <div className="relative flex-1">
            <select
              value={desa}
              onChange={(e) => setDesa(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 px-4 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Daerah (Desa)</option>
              {filterDesa.map(d => (
                <option key={d.id} value={d.id}>{d.nama_desa}</option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Hasil Pencarian */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {results.length > 0 ? (
            results.map(item => (
              tipe === 'produk' ? (
                <ProductCard key={item.id} product={item} />
              ) : (
                <WisataCard key={item.id} wisata={item} />
              )
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Tidak ada {tipe} yang cocok dengan filter Anda.
            </p>
          )}
        </div>
      )}
    </Layout>
  );
}

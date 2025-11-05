// File: src/pages/jelajah.js
// PERBAIKAN: 
// 1. Menambahkan 'toast' agar error pencarian/filter tampil ke user.
// 2. Menambahkan 'Link' dan 'DesaCard' yang hilang.
// 3. Menggunakan apiGetKategoriProduk, apiGetDesa, apiGetKategoriWisata
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import WisataCard from '@/components/WisataCard'; // Impor WisataCard
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch, apiGetKategoriProduk, apiGetDesa, apiGetKategoriWisata, apiGetProduk, apiGetWisata } from '@/lib/api'; // PERBAIKAN: Impor fungsi spesifik
import { IconSearch, IconX, IconFilter, IconChevronDown, IconMapPin } from '@/components/icons';
import Link from 'next/link'; // Impor Link
import { toast } from 'react-hot-toast'; // Impor toast

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
  try {
    const [kategoriProdukData, desaData, kategoriWisataData] = await Promise.all([
      apiGetKategoriProduk().catch(e => { console.error("Gagal fetch kategori produk:", e.message); return []; }),
      apiGetDesa({ per_page: 100 }).catch(e => { console.error("Gagal fetch desa:", e.message); return { data: [] }; }), 
      apiGetKategoriWisata().catch(e => { console.error("Gagal fetch kategori wisata:", e.message); return []; }),
    ]);
    return {
      props: {
        filterKategoriProduk: kategoriProdukData || [],
        filterKategoriWisata: kategoriWisataData || [],
        filterDesa: desaData.data || [], 
      },
    };
  } catch (error) {
    console.error("Gagal fetch data filter:", error);
    return { props: { filterKategoriProduk: [], filterKategoriWisata: [], filterDesa: [] } };
  }
}

// Komponen Card Desa (untuk hasil pencarian)
function DesaCard({ desa }) {
  return (
    <Link href={`/desa/${desa.id}`}>
      <div className="flex cursor-pointer items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg col-span-1">
        <img
          src={desa.foto || 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa'}
          alt={desa.nama_desa}
          className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
          onError={(e) => (e.target.src = 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa')}
        />
        <div className="flex-1 overflow-hidden">
          <h3 className="truncate font-semibold">{desa.nama_desa}</h3>
          <p className="mt-1 truncate text-sm text-gray-500">
            <IconMapPin className="mr-1 inline-block h-4 w-4" />
            {desa.kabupaten}, {desa.provinsi}
          </p>
        </div>
      </div>
    </Link>
  );
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
        let fetchFunction;
        if (tipe === 'wisata') fetchFunction = apiGetWisata;
        else if (tipe === 'desa') fetchFunction = apiGetDesa;
        else fetchFunction = apiGetProduk;

        const params = {};
        
        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }
        
        if (tipe !== 'desa') { 
          if (kategori) {
            params.kategori = kategori;
          }
          if (desa) {
            params.desa = desa;
          }
        }
        
        const data = await fetchFunction(params);
        setResults(data.data || []);
      } catch (error) {
        console.error(`Gagal fetch ${tipe}:`, error);
        // PERBAIKAN: Tampilkan error ke user
        toast.error(error.message);
        setResults([]);
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
    
    if (tipe !== 'desa') {
      if (kategori) params.set('kategori', kategori);
      if (desa) params.set('desa', desa);
    }

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
            placeholder={`Cari ${tipe}...`}
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

        {/* Toggler Tipe (Produk/Wisata/Desa) */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-gray-200 p-1">
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
          <button
            onClick={() => setTipe('desa')}
            className={`rounded-md py-2 text-center font-semibold ${tipe === 'desa' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
          >
            Desa
          </button>
        </div>
        
        {/* Filter (BARU) - Sembunyikan jika tipe 'desa' */}
        {tipe !== 'desa' && (
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
        )}
      </div>

      {/* Hasil Pencarian */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className={`grid gap-4 ${tipe === 'desa' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'}`}>
          {results.length > 0 ? (
            results.map(item => {
              if (tipe === 'produk') {
                return <ProductCard key={item.id} product={item} />;
              }
              if (tipe === 'wisata') {
                return <WisataCard key={item.id} wisata={item} />;
              }
              if (tipe === 'desa') {
                return <DesaCard key={item.id} desa={item} />;
              }
              return null;
            })
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
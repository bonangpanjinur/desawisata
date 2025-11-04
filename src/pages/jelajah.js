// src/pages/jelajah.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import { IconSearch, IconX } from '@/components/icons';

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

export default function JelajahPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(router.query.q || '');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Gunakan debouncing agar tidak memanggil API setiap ketikan
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Buat query string
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
          params.append('search', debouncedSearchTerm);
        }
        // TODO: Tambahkan filter kategori
        // if (kategori) params.append('kategori', kategori);
        
        const data = await apiFetch(`/produk?${params.toString()}`);
        setProducts(data.data || []);
      } catch (error) {
        console.error("Gagal fetch produk:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [debouncedSearchTerm]); // Hanya fetch ulang saat nilai debounce berubah

  // Update URL saat user mengetik
  useEffect(() => {
    if (searchTerm) {
      router.push(`/jelajah?q=${searchTerm}`, undefined, { shallow: true });
    } else {
      router.push(`/jelajah`, undefined, { shallow: true });
    }
  }, [searchTerm, router]);

  return (
    <Layout>
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Jelajah Produk</h1>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-30 mb-6 bg-background/80 py-4 backdrop-blur-sm">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari produk atau toko..."
            className="w-full rounded-full border border-gray-300 py-3 pl-12 pr-10 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
        {/* TODO: Tambahkan Tombol Filter Kategori di sini */}
      </div>

      {/* Hasil Pencarian */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.length > 0 ? (
            products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              {debouncedSearchTerm
                ? `Tidak ada produk yang cocok dengan "${debouncedSearchTerm}".`
                : "Belum ada produk untuk ditampilkan."}
            </p>
          )}
        </div>
      )}
    </Layout>
  );
}


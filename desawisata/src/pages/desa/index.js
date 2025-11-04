// File: src/pages/desa/index.js
// PERBAIKAN: Memperbaiki endpoint API, pengambilan data provinsi, dan logika filter
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';
import { IconSearch, IconChevronDown, IconMapPin } from '@/components/icons';

// Helper untuk mengambil data dengan aman (disimpan di sini)
const safeGetData = (response) => {
  if (Array.isArray(response)) return response;
  return response?.data || [];
};

export async function getServerSideProps() {
  try {
    const [desaResponse, provinsiResponse] = await Promise.all([
      apiFetch('/desa?per_page=100'), // Ambil semua desa
      // PERBAIKAN: Endpoint API yang benar adalah /alamat/provinsi
      apiFetch('/alamat/provinsi')   
    ]);

    return {
      props: {
        allDesa: safeGetData(desaResponse), // Ini sudah benar
        // PERBAIKAN: Endpoint provinsi mengembalikan array langsung
        filterProvinsi: provinsiResponse || [],
      },
    };
  } catch (error) {
    console.error("Gagal fetch data halaman desa:", error.message);
    return { props: { allDesa: [], filterProvinsi: [] } };
  }
}

export default function DesaIndexPage({ allDesa, filterProvinsi }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [provinsi, setProvinsi] = useState('');
  // const [kabupaten, setKabupaten] = useState(''); // TODO
  
  const [filteredDesa, setFilteredDesa] = useState(allDesa);

  useEffect(() => {
    let desa = allDesa;

    if (searchTerm) {
      desa = desa.filter(d => 
        d.nama_desa.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (provinsi) {
      // PERBAIKAN: Filter menggunakan `id_provinsi` dari data desa
      desa = desa.filter(d => d.id_provinsi == provinsi);
    }
    
    setFilteredDesa(desa);
  }, [searchTerm, provinsi, allDesa]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Jelajahi Desa</h1>

      {/* Search & Filter */}
      <div className="sticky top-16 z-30 mb-6 space-y-4 bg-background/80 py-4 backdrop-blur-sm">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama desa..."
            className="w-full rounded-full border border-gray-300 py-3 pl-12 pr-4 text-lg shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <IconSearch className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
        </div>
        
        {/* Filter Daerah */}
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative flex-1">
            <select
              value={provinsi}
              onChange={(e) => setProvinsi(e.target.value)}
              className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 px-4 pr-10 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Semua Provinsi</option>
              {/* PERBAIKAN: Gunakan p.code dan p.name dari API wilayah */}
              {filterProvinsi.map(p => (
                <option key={p.code} value={p.code}>{p.name}</option>
              ))}
            </select>
            <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          </div>
          {/* TODO: Tambahkan filter kabupaten di sini */}
        </div>
      </div>

      {/* Daftar Desa */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredDesa.length > 0 ? (
          filteredDesa.map(d => (
            <Link key={d.id} href={`/desa/${d.id}`}>
              <div className="flex cursor-pointer items-center gap-4 rounded-lg bg-white p-4 shadow-md transition-shadow hover:shadow-lg">
                <img
                  src={d.foto || 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa'}
                  alt={d.nama_desa}
                  className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                  onError={(e) => (e.target.src = 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa')}
                />
                <div className="flex-1 overflow-hidden">
                  <h3 className="truncate font-semibold">{d.nama_desa}</h3>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    <IconMapPin className="mr-1 inline-block h-4 w-4" />
                    {d.kabupaten}, {d.provinsi}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500">
            Tidak ada desa yang cocok dengan filter Anda.
          </p>
        )}
      </div>
    </Layout>
  );
}

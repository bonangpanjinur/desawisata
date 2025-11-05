// src/pages/wisata/[slug].js
// PERBAIKAN: Menyesuaikan akses data dengan API & memperbaiki link Gmaps
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import { IconMapPin, IconInfo } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';

const placeholderImg = "https://placehold.co/600x400/f4f4f5/a1a1aa?text=Wisata";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  try {
    const wisata = await apiFetch(`/wisata/slug/${slug}`);
    return { props: { wisata } };
  } catch (error) {
    console.error("Gagal fetch data wisata:", error);
    return { notFound: true };
  }
}

export default function WisataDetailPage({ wisata }) {
  const router = useRouter();

  if (router.isFallback || !wisata) {
    return <Layout><LoadingSpinner fullPage /></Layout>;
  }

  const imageUrl = wisata.gambar_unggulan?.large || placeholderImg;
  
  // PERBAIKAN: Akses data yang benar dari struktur API
  const namaDesa = wisata.desa?.nama_desa;
  const idDesa = wisata.desa?.id;
  const alamatLengkap = wisata.lokasi?.alamat || (namaDesa ? `Desa ${namaDesa}` : 'Lokasi');
  const hargaTiket = wisata.info?.harga_tiket || 0;
  const koordinat = wisata.lokasi?.koordinat; // Ini adalah string "lat,lng"

  return (
    <Layout>
      <div className="rounded-lg bg-white p-4 shadow-lg md:p-6">
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-gray-100 md:h-96">
          <Image
            src={imageUrl}
            alt={wisata.nama_wisata}
            layout="fill"
            objectFit="cover"
            unoptimized={true} // PERBAIKAN: Tambahkan unoptimized
            onError={(e) => (e.target.src = placeholderImg)}
          />
        </div>

        {idDesa && namaDesa && (
          <Link href={`/desa/${idDesa}`}>
            <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                <IconMapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-primary">{namaDesa}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  {alamatLengkap}
                </p>
              </div>
            </div>
          </Link>
        )}

        <h1 className="mb-2 text-3xl font-bold">{wisata.nama_wisata}</h1>
        
        <div className="mb-4 flex items-center gap-2 text-gray-600">
            <IconMapPin className="h-5 w-5" />
            <span className="font-semibold">{alamatLengkap}</span>
        </div>

        <p className="mb-4 text-3xl font-bold text-primary">
          {typeof hargaTiket === 'number' && hargaTiket > 0 
            ? `Rp ${hargaTiket.toLocaleString('id-ID')}`
            : (typeof hargaTiket === 'string' ? hargaTiket : 'Gratis')
          }
          {typeof hargaTiket === 'number' && <span className="text-base font-normal text-gray-500"> / orang</span>}
        </p>
        
        <div className="flex gap-4 mb-6">
            {koordinat && (
              <a
                  // PERBAIKAN: Gunakan koordinat string "lat,lng" langsung
                  href={`https://www.google.com/maps/search/?api=1&query=${koordinat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 rounded-lg border border-primary py-3 px-6 text-center text-lg font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
              >
                  Lihat di Peta
              </a>
            )}
        </div>

        <div className="prose prose-sm mt-8 max-w-none border-t pt-6">
          <h3 className="font-semibold">Deskripsi Wisata</h3>
          <div dangerouslySetInnerHTML={{ __html: wisata.deskripsi || '<p>Tidak ada deskripsi.</p>' }} />
        </div>
      </div>
    </Layout>
  );
}
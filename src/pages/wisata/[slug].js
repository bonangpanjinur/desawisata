// src/pages/wisata/[slug].js
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
    // Asumsi endpoint API adalah /wisata/slug/[slug]
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

  return (
    <Layout>
      <div className="rounded-lg bg-white p-4 shadow-lg md:p-6">
        {/* Gambar Wisata */}
        <div className="relative mb-4 h-64 w-full overflow-hidden rounded-lg bg-gray-100 md:h-96">
          <Image
            src={imageUrl}
            alt={wisata.nama_wisata}
            layout="fill"
            objectFit="cover"
            onError={(e) => (e.target.src = placeholderImg)}
          />
        </div>

        {/* Info Desa (jika ada) */}
        {wisata.id_desa && (
          <Link href={`/desa/${wisata.id_desa}`}>
            <div className="mb-4 flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50">
              <img
                src={wisata.foto_desa || 'https://placehold.co/100x100/e2e8f0/a1a1aa?text=Desa'}
                alt={wisata.nama_desa}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-primary">{wisata.nama_desa}</h3>
                <p className="flex items-center gap-1 text-sm text-gray-500">
                  <IconMapPin className="h-4 w-4" /> {wisata.kabupaten_desa}
                </p>
              </div>
            </div>
          </Link>
        )}

        {/* Info Wisata */}
        <h1 className="mb-2 text-3xl font-bold">{wisata.nama_wisata}</h1>
        
        {/* Lokasi */}
        <div className="mb-4 flex items-center gap-2 text-gray-600">
            <IconMapPin className="h-5 w-5" />
            <span className="font-semibold">{wisata.lokasi_singkat || 'Lokasi'}</span>
        </div>

        {/* Harga Tiket */}
        <p className="mb-4 text-3xl font-bold text-primary">
          {wisata.harga_tiket > 0 ? `Rp ${wisata.harga_tiket.toLocaleString('id-ID')}` : 'Gratis'}
          <span className="text-base font-normal text-gray-500"> / orang</span>
        </p>
        
        {/* Tombol Aksi (Contoh: Beli Tiket, Arahkan ke Google Maps) */}
        <div className="flex gap-4 mb-6">
            {/* <button
                className="flex-1 rounded-lg bg-primary py-3 px-6 text-lg font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark"
            >
                Pesan Tiket
            </button> */}
             <a
                href={`https://www.google.com/maps/search/?api=1&query=${wisata.latitude},${wisata.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg border border-primary py-3 px-6 text-center text-lg font-semibold text-primary shadow-sm transition-colors hover:bg-primary/5"
            >
                Lihat di Peta
            </a>
        </div>


        {/* Deskripsi */}
        <div className="prose prose-sm mt-8 max-w-none border-t pt-6">
          <h3 className="font-semibold">Deskripsi Wisata</h3>
          <div dangerouslySetInnerHTML={{ __html: wisata.deskripsi || '<p>Tidak ada deskripsi.</p>' }} />
        </div>

      </div>
    </Layout>
  );
}

// src/pages/pesanan/[id].js
import { useRouter } from 'next/router';
import useSWR from 'swr'; // SWR untuk auto-refresh data
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { apiFetch } from '@/lib/api';
import Image from 'next/image';
import { IconCheckCircle } from '@/components/icons';

const placeholderImg = "https://placehold.co/100x100/f4f4f5/a1a1aa?text=Sadesa";

// Fetcher function untuk SWR
const fetcher = (url) => apiFetch(url);

export default function PesananDetailPage() {
  const router = useRouter();
  const { id, success } = router.query;

  // Gunakan SWR untuk mengambil data pesanan.
  // Ini akan otomatis refresh jika data berubah (misal: status update)
  const { data: order, error, isLoading } = useSWR(id ? `/orders/me/${id}` : null, fetcher, {
    refreshInterval: 30000 // Refresh setiap 30 detik
  });

  // TODO: Tambahkan fungsi untuk Upload Bukti Bayar

  if (isLoading || !order) return <Layout><LoadingSpinner fullPage /></Layout>;
  if (error) return <Layout><p className="text-red-500">Gagal memuat pesanan.</p></Layout>;

  return (
    <Layout>
      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-lg bg-green-100 p-4 text-green-800">
          <IconCheckCircle className="h-6 w-6" />
          <p className="font-semibold">Pesanan Anda berhasil dibuat!</p>
        </div>
      )}

      <div className="rounded-lg bg-white p-6 shadow-lg">
        {/* Header Pesanan */}
        <div className="border-b pb-4 mb-4">
          <h1 className="text-2xl font-bold">Detail Pesanan</h1>
          <p className="text-gray-500">ID Pesanan: <span className="font-semibold text-primary">{order.kode_unik}</span></p>
          <div className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold 
            ${order.status_pesanan === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {order.status_label}
          </div>
        </div>

        {/* Info Pembayaran (jika belum lunas) */}
        {['menunggu_pembayaran', 'menunggu_konfirmasi'].includes(order.status_pesanan) && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-800">Menunggu Pembayaran</h3>
            <p className="text-sm text-blue-700 mt-1">
              Silakan transfer sejumlah <strong className="text-lg">Rp {order.total_akhir.toLocaleString('id-ID')}</strong> ke rekening pedagang:
            </p>
            <div className="mt-3 text-sm text-gray-800">
              <p>Bank: <strong>{order.pedagang.rekening_bank || 'N/A'}</strong></p>
              <p>No. Rek: <strong>{order.pedagang.rekening_no || 'N/A'}</strong></p>
              <p>A/n: <strong>{order.pedagang.rekening_an || 'N/A'}</strong></p>
            </div>
            
            {/* TODO: Form Upload Bukti Bayar */}
            <div className="mt-4">
              <p className="font-semibold text-red-500">Fitur Upload Bukti Bayar belum terimplementasi.</p>
              {/* <input type="file" />
              <button className="... bg-primary ...">Upload Bukti</button>
              */}
              {order.url_bukti_bayar && (
                <p className="text-green-600">Bukti bayar sudah diupload. Menunggu konfirmasi.</p>
              )}
            </div>
          </div>
        )}

        {/* Rincian Item */}
        <div className="space-y-4 mb-6">
          <h3 className="font-semibold">Produk yang Dipesan (dari {order.pedagang.nama_toko})</h3>
          {order.items.map(item => (
            <div key={item.id} className="flex gap-4">
              <Image
                src={item.gambar_url || placeholderImg}
                alt={item.nama_produk}
                width={64}
                height={64}
                className="rounded-lg object-cover"
                onError={(e) => e.target.src = placeholderImg}
              />
              <div className="flex-1">
                <p className="font-semibold">{item.nama_produk}</p>
                {item.deskripsi_variasi && (
                  <p className="text-sm text-gray-500">{item.deskripsi_variasi}</p>
                )}
                <p className="text-sm text-gray-500">{item.kuantitas} x Rp {item.harga_satuan.toLocaleString('id-ID')}</p>
              </div>
              <p className="font-semibold">Rp {(item.kuantitas * item.harga_satuan).toLocaleString('id-ID')}</p>
            </div>
          ))}
        </div>

        {/* Rincian Total */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal Produk</span>
            <span className="font-semibold">Rp {order.total_harga_produk.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between">
            <span>Ongkos Kirim ({dw_get_order_status_label(order.metode_pengiriman)})</span>
            <span className="font-semibold">Rp {order.biaya_ongkir_final.toLocaleString('id-ID')}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t mt-2">
            <span>Total Akhir</span>
            <span className="text-primary">Rp {order.total_akhir.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Info Pengiriman */}
        <div className="border-t pt-4 mt-6">
          <h3 className="font-semibold mb-2">Info Pengiriman</h3>
          <p className="text-sm text-gray-700">{order.alamat_pengiriman}</p>
          {order.nomor_resi && (
            <p className="text-sm text-gray-700 mt-2">No. Resi: <strong className="text-gray-900">{order.nomor_resi}</strong></p>
          )}
        </div>

      </div>
    </Layout>
  );
}


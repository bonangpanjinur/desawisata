/**
 * LOKASI FILE: src/pages/pesanan/[id].js
 * PERBAIKAN:
 * 1. Mengganti nama impor 'apiGetOrderDetail' menjadi 'apiGetMyOrderDetail'.
 * 2. Mengubah format `toast.error`.
 * 3. Mengubah impor authStore menjadi impor bernama.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore'; // PERBAIKAN: Impor bernama
import Layout from '@/components/Layout';
import { apiGetMyOrderDetail, apiUploadFile, apiConfirmPayment } from '@/lib/api'; // PERBAIKAN NAMA FUNGSI
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function PesananDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, token } = useAuthStore(); // PERBAIKAN: Panggil sebagai fungsi
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!token) {
      router.push(`/akun?redirect=/pesanan/${id}`);
      return;
    }
    if (id) {
      const fetchOrder = async () => {
        setLoading(true);
        try {
          const data = await apiGetMyOrderDetail(id); // PERBAIKAN NAMA FUNGSI
          setOrder(data);
        } catch (error) {
          console.error('Gagal mengambil detail pesanan:', error);
          // PERBAIKAN: Tampilkan pesan error spesifik
          toast.error(error.message);
          router.push('/akun?tab=pesanan');
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id, token, router]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadAndConfirm = async () => {
    if (!file) {
      toast.error('Silakan pilih file bukti pembayaran.');
      return;
    }

    setUploading(true);
    setConfirming(true);
    let fileUrl = '';

    try {
      // 1. Upload file
      toast.loading('Mengunggah file...');
      const uploadData = await apiUploadFile(file);
      fileUrl = uploadData.url;
      toast.dismiss();
      toast.success('File berhasil diunggah!');
      setUploading(false);

      // 2. Konfirmasi pembayaran
      toast.loading('Mengonfirmasi pembayaran...');
      const confirmData = {
        order_id: order.id,
        payment_proof_url: fileUrl,
        notes: 'Pembayaran via frontend.',
      };
      await apiConfirmPayment(confirmData);
      toast.dismiss();
      toast.success('Pembayaran berhasil dikonfirmasi!');

      // 3. Muat ulang data pesanan
      const newData = await apiGetMyOrderDetail(id); // PERBAIKAN NAMA FUNGSI
      setOrder(newData);
      setFile(null);

    } catch (error) {
      console.error('Gagal konfirmasi pembayaran:', error);
      toast.dismiss();
      // PERBAIKAN: Tampilkan pesan error spesifik
      toast.error(error.message);
    } finally {
      setUploading(false);
      setConfirming(false);
    }
  };

  if (loading || !order) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  const isPaymentPending = order.status_transaksi === 'menunggu_pembayaran';

  return (
    <Layout>
      <div className="container mx-auto max-w-2xl p-4 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Detail Pesanan #{order.kode_unik}</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <p><strong>Status:</strong> <span className={`font-semibold ${isPaymentPending ? 'text-yellow-600' : 'text-green-600'}`}>{order.status_transaksi.replace('_', ' ')}</span></p>
            <p><strong>Tanggal:</strong> {new Date(order.tanggal_transaksi).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="text-xl font-bold mt-2">Total: {formatCurrency(order.total_transaksi)}</p>
          </div>

          {isPaymentPending && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-semibold mb-2">Instruksi Pembayaran</h2>
              <p>Silakan transfer sejumlah <strong>{formatCurrency(order.total_transaksi)}</strong> ke rekening berikut:</p>
              <div className="my-2 p-3 bg-gray-100 rounded">
                <p><strong>Bank BCA:</strong> 123456789 (a/n Desa Wisata)</p>
                <p><strong>Bank Mandiri:</strong> 987654321 (a/n Desa Wisata)</p>
              </div>
              <p className="text-red-600 font-medium">PENTING: Harap unggah bukti transfer Anda untuk verifikasi.</p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Transfer (JPG/PNG)</label>
                <input 
                  type="file" 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg"
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <button
                onClick={handleUploadAndConfirm}
                disabled={uploading || confirming || !file}
                className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg mt-4 hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {uploading ? 'Mengunggah...' : (confirming ? 'Mengonfirmasi...' : 'Konfirmasi Pembayaran')}
              </button>
            </div>
          )}

          {!isPaymentPending && order.bukti_pembayaran && (
            <div className="border-t pt-4 mt-4">
              <h2 className="text-lg font-semibold mb-2">Bukti Pembayaran</h2>
              <img src={order.bukti_pembayaran} alt="Bukti Pembayaran" className="max-w-xs rounded-md shadow-sm" />
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Rincian Pesanan</h2>
            {order.sub_pesanan.map(subOrder => (
              <div key={subOrder.id} className="mb-4 border-b pb-4">
                <h3 className="font-semibold text-gray-800">Toko: {subOrder.nama_toko}</h3>
                <p className="text-sm text-gray-600">Status Toko: {subOrder.status_pesanan.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">Metode Pengiriman: {subOrder.metode_pengiriman.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">Ongkir Toko Ini: {formatCurrency(subOrder.ongkir)}</p>
                
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {subOrder.items.map(item => (
                    <li key={item.id} className="text-sm">
                      {item.nama_produk} {item.nama_variasi && `(${item.nama_variasi})`} x {item.jumlah} 
                      <span className="float-right">{formatCurrency(item.total_harga)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 mt-4">
            <h2 className="text-lg font-semibold mb-2">Alamat Pengiriman</h2>
            <div className="text-sm text-gray-700">
              <p><strong>{order.alamat_pengiriman.nama_penerima}</strong></p>
              <p>{order.alamat_pengiriman.no_hp}</p>
              <p>{order.alamat_pengiriman.alamat_lengkap}</p>
              <p>{order.alamat_pengiriman.kelurahan}, {order.alamat_pengiriman.kecamatan}</p>
              <p>{order.alamat_pengiriman.kabupaten}, {order.alamat_pengiriman.provinsi}</p>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
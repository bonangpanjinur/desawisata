// File: src/pages/pesanan/[id].js
// PERBAIKAN: Implementasi detail pesanan dan upload bukti bayar
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { apiGetOrderDetail, apiUploadFile, apiConfirmPayment } from '@/lib/api';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IconAlertCircle, IconCheckCircle, IconClock, IconFileUpload, IconInfo } from '@/components/icons';

// (Asumsi) Helper formatCurrency, pindahkan ke lib/utils.js jika belum ada
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { token } = useAuthStore();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State untuk form konfirmasi
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(null);
  const [confirmSuccess, setConfirmSuccess] = useState(null);

  // Fungsi untuk mengambil data pesanan
  const fetchOrder = async () => {
    if (!id || !token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetOrderDetail(id);
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Gagal mengambil data pesanan.');
    } finally {
      setLoading(false);
    }
  };

  // Ambil data pesanan saat ID atau token berubah
  useEffect(() => {
    if (!token) {
      router.push('/akun');
      return;
    }
    if (id) {
      fetchOrder();
    }
  }, [id, token, router]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewImage(null);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile) {
      setConfirmError('Silakan pilih file bukti pembayaran.');
      return;
    }

    setConfirmError(null);
    setConfirmSuccess(null);
    setIsUploading(true);

    try {
      // 1. Upload file dulu
      const uploadData = await apiUploadFile(selectedFile);
      setIsUploading(false);
      
      if (!uploadData || !uploadData.url) {
        throw new Error('Gagal mengunggah file.');
      }

      // 2. Konfirmasi pembayaran dengan URL file
      setIsConfirming(true);
      const confirmData = await apiConfirmPayment(id, uploadData.url, notes);
      
      setConfirmSuccess(confirmData.message || 'Konfirmasi berhasil!');
      // Refresh data pesanan
      fetchOrder();

    } catch (err) {
      setConfirmError(err.message || 'Terjadi kesalahan.');
    } finally {
      setIsUploading(false);
      setIsConfirming(false);
    }
  };

  // Helper untuk Status Badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'menunggu_pembayaran':
        return <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800"><IconClock className="h-4 w-4" />Menunggu Pembayaran</span>;
      case 'menunggu_konfirmasi':
        return <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800"><IconInfo className="h-4 w-4" />Menunggu Konfirmasi</span>;
      case 'diproses':
        return <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-800"><IconClock className="h-4 w-4" />Diproses</span>;
      case 'dikirim':
        return <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"><IconCheckCircle className="h-4 w-4" />Dikirim</span>;
      case 'selesai':
        return <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"><IconCheckCircle className="h-4 w-4" />Selesai</span>;
      case 'dibatalkan':
        return <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800"><IconAlertCircle className="h-4 w-4" />Dibatalkan</span>;
      default:
        return <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">{status}</span>;
    }
  };

  if (loading) return <Layout><LoadingSpinner /></Layout>;
  if (error) return <Layout><div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div></Layout>;
  if (!order) return <Layout><p>Pesanan tidak ditemukan.</p></Layout>;

  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold">Detail Pesanan</h1>
      
      {/* Info Pesanan Utama */}
      <section className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <div className="mb-4 flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-gray-500">Nomor Pesanan</p>
            <p className="font-semibold text-primary">{order.kode_unik}</p>
          </div>
          {getStatusBadge(order.status_transaksi)}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tanggal</p>
            <p className="font-medium">{new Date(order.tanggal_transaksi).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
          </div>
          <div>
            <p className="text-gray-500">Metode Pembayaran</p>
            <p className="font-medium">{order.metode_pembayaran === 'manual_transfer' ? 'Transfer Bank (Manual)' : order.metode_pembayaran}</p>
          </div>
        </div>
      </section>

      {/* [BLOK KONFIRMASI] - Tampil jika menunggu pembayaran */}
      {order.status_transaksi === 'menunggu_pembayaran' && (
        <section className="mb-6 rounded-lg bg-white p-4 shadow-md">
          <h2 className="mb-3 text-lg font-semibold text-primary">Segera Lakukan Pembayaran</h2>
          <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
            <p className="font-semibold">Transfer ke rekening berikut:</p>
            <p>Bank BCA: <strong className="font-bold">1234567890</strong> a/n Desa Wisata</p>
            <p>Bank BRI: <strong className="font-bold">0987654321</strong> a/n Desa Wisata</p>
            <p className="mt-2">Total Pembayaran: <strong className="text-lg font-bold">{formatCurrency(order.total_transaksi)}</strong></p>
          </div>

          <h3 className="mt-6 mb-3 text-lg font-semibold">Konfirmasi Pembayaran</h3>
          
          {confirmSuccess && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-green-700">{confirmSuccess}</div>
          )}
          {confirmError && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">{confirmError}</div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700">Upload Bukti Pembayaran</label>
              <div className="mt-1 flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <IconFileUpload className="h-5 w-5" />
                  <span>{selectedFile ? 'Ganti File' : 'Pilih File'}</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                </label>
                {previewImage && (
                  <img src={previewImage} alt="Preview" className="h-16 w-16 rounded-md object-cover" />
                )}
                {selectedFile && !previewImage && (
                  <span className="text-sm text-gray-500">{selectedFile.name}</span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Catatan (Opsional)</label>
              <textarea
                id="notes"
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                placeholder="Contoh: Sudah ditransfer dari rekening Bpk. Budi"
              />
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={isUploading || isConfirming}
              className="flex w-full justify-center rounded-lg bg-primary py-3 px-4 font-semibold text-white shadow transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isUploading && <LoadingSpinner className="h-5 w-5" />}
              {!isUploading && isConfirming && <LoadingSpinner className="h-5 w-5" />}
              {!isUploading && !isConfirming && 'Kirim Konfirmasi Pembayaran'}
            </button>
          </div>
        </section>
      )}

      {/* [BLOK INFO] - Status lain */}
      {order.status_transaksi === 'menunggu_konfirmasi' && (
         <section className="mb-6 rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-800 shadow-md">
            <p className="font-semibold">Bukti pembayaran telah diterima.</p>
            <p>Admin akan segera memverifikasi pembayaran Anda.</p>
         </section>
      )}
      
      {order.status_transaksi === 'diproses' && (
         <section className="mb-6 rounded-lg bg-cyan-50 p-4 text-center text-sm text-cyan-800 shadow-md">
            <p className="font-semibold">Pembayaran dikonfirmasi!</p>
            <p>Pesanan Anda sedang disiapkan oleh penjual.</p>
         </section>
      )}

      {/* Rincian Pesanan per Toko */}
      <h2 className="mb-3 text-lg font-semibold">Rincian Pesanan</h2>
      <section className="mb-6 flex flex-col gap-4">
        {order.sub_pesanan.map(sub => (
          <div key={sub.id} className="rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 font-semibold text-primary">{sub.nama_toko}</h3>
            <p className="mb-2 text-xs text-gray-500">Status: {getStatusBadge(sub.status_pesanan)}</p>
            
            {sub.items.map(item => (
              <div key={item.id} className="mb-2 flex gap-3 border-b pb-2">
                {/* Asumsi item tidak punya gambar, jika ada tambahkan <img> */}
                <div className="flex-shrink-0 pt-1">
                  <span className="inline-block h-6 w-6 rounded-md bg-gray-200"></span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.nama_produk}</p>
                  {item.nama_variasi && (
                    <p className="text-xs text-gray-500">{item.nama_variasi}</p>
                  )}
                  <p className="text-sm">{item.jumlah} x {formatCurrency(item.harga)}</p>
                </div>
                <p className="ml-auto text-sm font-semibold">{formatCurrency(item.total_harga)}</p>
              </div>
            ))}
            
            <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                    <p className="text-gray-600">Subtotal ({sub.items.length} item)</p>
                    <p className="font-medium">{formatCurrency(sub.subtotal)}</p>
                </div>
                 <div className="flex justify-between">
                    <p className="text-gray-600">Ongkir ({sub.metode_pengiriman})</p>
                    <p className="font-medium">{formatCurrency(sub.ongkir)}</p>
                </div>
                 <div className="flex justify-between font-semibold">
                    <p>Total Toko</p>
                    <p>{formatCurrency(sub.total_pesanan)}</p>
                </div>
            </div>
          </div>
        ))}
      </section>

      {/* Ringkasan & Alamat */}
      <section className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Ringkasan Pembayaran</h2>
        <div className="space-y-1 text-sm">
            <div className="flex justify-between">
                <p className="text-gray-600">Total Belanja</p>
                <p className="font-medium">{formatCurrency(parseFloat(order.total_transaksi) - parseFloat(order.total_ongkir))}</p>
            </div>
            <div className="flex justify-between">
                <p className="text-gray-600">Total Ongkos Kirim</p>
                <p className="font-medium">{formatCurrency(order.total_ongkir)}</p>
            </div>
            <hr className="py-1" />
            <div className="flex justify-between text-base font-bold">
                <p>Total Tagihan</p>
                <p className="text-primary">{formatCurrency(order.total_transaksi)}</p>
            </div>
        </div>

        <hr className="my-4" />

        <h2 className="mb-3 text-lg font-semibold">Alamat Pengiriman</h2>
        {order.alamat_pengiriman ? (
          <div>
            <p className="font-semibold">{order.alamat_pengiriman.nama_penerima} ({order.alamat_pengiriman.no_hp})</p>
            <p className="text-sm text-gray-600">{order.alamat_pengiriman.alamat_lengkap}</p>
            <p className="text-sm text-gray-600">{order.alamat_pengiriman.kelurahan}, {order.alamat_pengiriman.kecamatan}, {order.alamat_pengiriman.kabupaten}, {order.alamat_pengiriman.provinsi}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Alamat tidak tersedia.</p>
        )}
      </section>
    </Layout>
  );
}

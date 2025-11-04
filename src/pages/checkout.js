// File: src/pages/checkout.js
// PERBAIKAN: Implementasi alur checkout penuh
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { apiFetch, apiPost, apiGetShippingOptions, apiCreateOrder, apiGetMyAddresses } from '@/lib/api'; // Impor fungsi API baru
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IconMapPin, IconChevronRight, IconPlus, IconTruck, IconWallet, IconInfo } from '@/components/icons';
import { formatCurrency } from '@/lib/utils'; // Asumsi ada helper formatCurrency

// (Asumsi) Helper formatCurrency, pindahkan ke lib/utils.js jika belum ada
// export function formatCurrency(amount) {
//   return new Intl.NumberFormat('id-ID', {
//     style: 'currency',
//     currency: 'IDR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// }

export default function CheckoutPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { items, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState(null);

  // Data Checkout
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [sellerGroups, setSellerGroups] = useState({}); // { pedagang_id: { nama_toko: '...', items: [...] } }
  const [shippingOptions, setShippingOptions] = useState({}); // { pedagang_id: { nama_toko: '...', options: [...] } }
  const [selectedShipping, setSelectedShipping] = useState({}); // { pedagang_id: { metode: '...', harga: 123 } }
  const [paymentMethod, setPaymentMethod] = useState('manual_transfer'); // Metode pembayaran default

  // Total
  const [subtotal, setSubtotal] = useState(0);
  const [totalShipping, setTotalShipping] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Helper formatCurrency (atau impor dari lib/utils)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 1. Cek Login, Keranjang, dan Ambil Alamat
  useEffect(() => {
    if (!token) {
      router.push('/akun'); // Wajib login
      return;
    }
    if (items.length === 0) {
      router.push('/keranjang'); // Keranjang kosong
      return;
    }

    // Kelompokkan item berdasarkan seller_id (pedagang_id)
    let currentSubtotal = 0;
    const groups = items.reduce((acc, item) => {
      const sellerId = item.seller_id; // Pastikan ini ada di item keranjang!
      if (!acc[sellerId]) {
        acc[sellerId] = {
          nama_toko: item.nama_toko || 'Toko', // Pastikan ini ada
          items: [],
        };
      }
      acc[sellerId].items.push(item);
      currentSubtotal += item.price * item.quantity;
      return acc;
    }, {});
    setSellerGroups(groups);
    setSubtotal(currentSubtotal);

    // Ambil alamat
    const fetchAddresses = async () => {
      try {
        setIsLoading(true);
        const data = await apiGetMyAddresses();
        setAddresses(data.addresses || []);
        
        // Set alamat utama (jika ada)
        const defaultAddress = data.addresses.find(addr => addr.id === data.default_address_id);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]); // Fallback ke alamat pertama
        }
      } catch (err) {
        setError('Gagal mengambil data alamat.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAddresses();
  }, [token, items, router]);

  // 2. Ambil Opsi Pengiriman saat alamat berubah
  useEffect(() => {
    if (!selectedAddress) {
      setShippingOptions({});
      return;
    }

    const fetchShipping = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Buat payload cart_items sederhana
        const cartPayload = items.map(item => ({ product_id: item.product_id }));
        // Buat payload address_api
        const addressApiPayload = {
          kecamatan_id: selectedAddress.api_kecamatan_id,
          kelurahan_id: selectedAddress.api_kelurahan_id,
          kabupaten_id: selectedAddress.api_kabupaten_id,
        };
        
        const data = await apiGetShippingOptions(cartPayload, addressApiPayload);
        setShippingOptions(data.seller_options || {});
        // Reset pilihan shipping sebelumnya
        setSelectedShipping({}); 
      } catch (err) {
        setError('Gagal mengambil opsi pengiriman: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShipping();
  }, [selectedAddress, items]);

  // 3. Hitung Ulang Total
  useEffect(() => {
    let newTotalShipping = 0;
    for (const sellerId in selectedShipping) {
      newTotalShipping += selectedShipping[sellerId].harga || 0;
    }
    setTotalShipping(newTotalShipping);
    setGrandTotal(subtotal + newTotalShipping);
  }, [selectedShipping, subtotal]);

  // 4. Handler untuk memilih pengiriman
  const handleShippingSelect = (sellerId, option) => {
    setSelectedShipping(prev => ({
      ...prev,
      [sellerId]: {
        metode: option.metode,
        harga: option.harga,
        nama: option.nama,
      },
    }));
  };

  // 5. Handler untuk Buat Pesanan
  const handlePlaceOrder = async () => {
    setError(null);
    
    // Validasi
    if (!selectedAddress) {
      setError('Silakan pilih alamat pengiriman.'); return;
    }
    if (Object.keys(selectedShipping).length !== Object.keys(sellerGroups).length) {
      setError('Silakan pilih metode pengiriman untuk semua toko.'); return;
    }
    if (!paymentMethod) {
      setError('Silakan pilih metode pembayaran.'); return;
    }

    setIsPlacingOrder(true);
    try {
      const payload = {
        cart_items: items, // Kirim cart items lengkap
        shipping_address_id: selectedAddress.id,
        seller_shipping_choices: selectedShipping,
        payment_method: paymentMethod,
      };

      const data = await apiCreateOrder(payload);
      
      // Sukses!
      clearCart(); // Kosongkan keranjang
      router.push(`/pesanan/${data.order_id}`); // Redirect ke halaman detail pesanan

    } catch (err) {
      setError(err.message || 'Gagal membuat pesanan.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Helper render
  const renderShippingOptions = (sellerId) => {
    const optionsData = shippingOptions[sellerId];
    if (isLoading) return <LoadingSpinner />;
    if (!optionsData || !optionsData.options) return <p className="text-sm text-red-500">Tidak ada pengiriman.</p>;
    
    return (
      <div className="flex flex-col gap-2">
        {optionsData.options.map((opt, index) => (
          <label
            key={index}
            className={`flex items-center justify-between rounded-lg border p-3 ${selectedShipping[sellerId]?.metode === opt.metode ? 'border-primary ring-2 ring-primary' : 'border-gray-300'}`}
          >
            <div className="flex items-center">
              <input
                type="radio"
                name={`shipping_${sellerId}`}
                checked={selectedShipping[sellerId]?.metode === opt.metode}
                onChange={() => handleShippingSelect(sellerId, opt)}
                className="h-4 w-4 text-primary focus:ring-primary"
                disabled={opt.metode === 'tidak_tersedia'}
              />
              <span className="ml-3 text-sm font-medium">{opt.nama}</span>
            </div>
            <span className="text-sm font-semibold">
              {opt.harga !== null ? formatCurrency(opt.harga) : '-'}
            </span>
          </label>
        ))}
      </div>
    );
  };


  if (isLoading && !selectedAddress) {
    return <Layout><LoadingSpinner /></Layout>;
  }

  return (
    <Layout>
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>

      {/* 1. Alamat Pengiriman */}
      <section className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <h2 className="mb-3 text-lg font-semibold">Alamat Pengiriman</h2>
        {selectedAddress ? (
          <div>
            <p className="font-semibold">{selectedAddress.nama_penerima} ({selectedAddress.no_hp})</p>
            <p className="text-sm text-gray-600">{selectedAddress.alamat_lengkap}</p>
            <p className="text-sm text-gray-600">{selectedAddress.kelurahan}, {selectedAddress.kecamatan}, {selectedAddress.kabupaten}, {selectedAddress.provinsi}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Anda belum memiliki alamat.</p>
        )}
        <button
          onClick={() => alert('Fitur ganti/tambah alamat belum diimplementasikan')}
          className="mt-3 flex items-center gap-1 text-sm font-semibold text-primary"
        >
          {addresses.length > 0 ? 'Ganti Alamat' : 'Tambah Alamat'}
          <IconChevronRight className="h-4 w-4" />
        </button>
      </section>

      {/* 2. Daftar Pesanan & Opsi Pengiriman per Toko */}
      <section className="mb-6 flex flex-col gap-4">
        {Object.keys(sellerGroups).map(sellerId => (
          <div key={sellerId} className="rounded-lg bg-white p-4 shadow-md">
            <h3 className="mb-3 font-semibold text-primary">{sellerGroups[sellerId].nama_toko}</h3>
            {/* Item list */}
            {sellerGroups[sellerId].items.map(item => (
              <div key={item.id} className="mb-2 flex gap-3 border-b pb-2">
                <img src={item.image} alt={item.name} className="h-16 w-16 rounded-md object-cover" />
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.variation_name}</p>
                  <p className="text-sm">{item.quantity} x {formatCurrency(item.price)}</p>
                </div>
              </div>
            ))}
            {/* Opsi Pengiriman */}
            <div className="mt-4">
              <h4 className="mb-2 flex items-center gap-1 text-sm font-semibold">
                <IconTruck className="h-5 w-5" />
                Pilih Pengiriman
              </h4>
              {!selectedAddress ? (
                <p className="text-xs text-gray-500">Pilih alamat terlebih dahulu.</p>
              ) : (
                renderShippingOptions(sellerId)
              )}
            </div>
          </div>
        ))}
      </section>

      {/* 3. Metode Pembayaran */}
      <section className="mb-6 rounded-lg bg-white p-4 shadow-md">
         <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <IconWallet className="h-6 w-6" />
          Metode Pembayaran
        </h2>
        <div>
          <label className="flex items-center rounded-lg border border-primary p-3 ring-2 ring-primary">
            <input
              type="radio"
              name="payment"
              value="manual_transfer"
              checked={paymentMethod === 'manual_transfer'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="h-4 w-4 text-primary focus:ring-primary"
            />
            <span className="ml-3 text-sm font-medium">Transfer Bank (Manual)</span>
          </label>
        </div>
      </section>

      {/* 4. Ringkasan & Tombol Bayar */}
      <section className="sticky bottom-[68px] rounded-t-lg border-t bg-white p-4 shadow-lg md:bottom-0 md:rounded-lg">
        <h2 className="mb-3 text-lg font-semibold">Ringkasan Belanja</h2>
        <div className="flex justify-between text-sm">
          <p className="text-gray-600">Subtotal ({items.length} item)</p>
          <p className="font-semibold">{formatCurrency(subtotal)}</p>
        </div>
        <div className="flex justify-between text-sm">
          <p className="text-gray-600">Total Ongkos Kirim</p>
          <p className="font-semibold">{formatCurrency(totalShipping)}</p>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between text-lg font-bold">
          <p>Total Tagihan</p>
          <p className="text-primary">{formatCurrency(grandTotal)}</p>
        </div>
        
        {error && (
          <p className="mt-3 text-center text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || isLoading}
          className="mt-4 w-full rounded-lg bg-primary py-3 px-4 font-semibold text-white shadow transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isPlacingOrder ? <LoadingSpinner className="h-5 w-5" /> : 'Buat Pesanan'}
        </button>
      </section>
    </Layout>
  );
}

// src/pages/checkout.js
// PERBAIKAN: Menambahkan state 'loadingOrder' dan feedback toast
// untuk tombol "Buat Pesanan".

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import Layout from '@/components/Layout';
import { apiGetShippingOptions, apiCreateOrder, apiGetAlamat } from '@/lib/api';
import { toast } from 'react-hot-toast'; // Sudah diimpor
import { formatCurrency } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Checkout() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const { cart, getTotalPrice, clearCart, getCartGroupedBySeller } = useCartStore();

  const [alamatList, setAlamatList] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const [shippingOptions, setShippingOptions] = useState(null); // { sellerId: { nama_toko: '...', options: [...] } }
  const [selectedShipping, setSelectedShipping] = useState({}); // { sellerId: { metode: '...', harga: ... } }
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  
  const [loadingAlamat, setLoadingAlamat] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(false);
  // 1. Tambahkan state loading untuk proses order
  const [loadingOrder, setLoadingOrder] = useState(false); 

  const groupedCart = useMemo(() => getCartGroupedBySeller(), [cart]);
  const totalPrice = getTotalPrice();
  
  // Hitung total ongkir
  const totalShipping = useMemo(() => {
    return Object.values(selectedShipping).reduce((total, option) => total + (option.harga || 0), 0);
  }, [selectedShipping]);

  // Cek apakah semua pengiriman sudah dipilih
  const isOrderReady = useMemo(() => {
    const sellerIdsInCart = Object.keys(groupedCart);
    const selectedSellerIds = Object.keys(selectedShipping);
    return sellerIdsInCart.length > 0 && selectedSellerIds.length === sellerIdsInCart.length;
  }, [groupedCart, selectedShipping]);


  // Efek untuk mengambil alamat pengguna
  useEffect(() => {
    if (!user) {
      toast.error('Anda harus login untuk checkout.');
      router.push('/akun');
      return;
    }

    const fetchAlamat = async () => {
      setLoadingAlamat(true);
      try {
        const data = await apiGetAlamat(); // Asumsi apiGetAlamat ada di api.js
        setAlamatList(data.addresses || []);
        // Set alamat default jika ada
        const defaultAlamat = data.addresses.find(a => a.id === data.default_address_id);
        if (defaultAlamat) {
          setSelectedAlamat(defaultAlamat);
        } else if (data.addresses.length > 0) {
          setSelectedAlamat(data.addresses[0]); // Fallback ke alamat pertama
        }
      } catch (error) {
        console.error('Gagal memuat alamat:', error);
        toast.error('Gagal memuat alamat. Harap refresh halaman.');
      } finally {
        setLoadingAlamat(false);
      }
    };
    fetchAlamat();
  }, [user, router]);

  // Efek untuk mengambil opsi pengiriman ketika alamat atau keranjang berubah
  useEffect(() => {
    if (!selectedAlamat || cart.length === 0) {
      setShippingOptions(null); // Kosongkan opsi jika tidak ada alamat/item
      return;
    }

    const fetchShippingOptions = async () => {
      setLoadingShipping(true);
      setShippingOptions(null); // Reset
      setSelectedShipping({}); // Reset pilihan
      
      const cartItemsForApi = cart.map(item => ({
        product_id: item.productId,
        // ... (data lain mungkin diperlukan oleh API Anda)
      }));

      try {
        const data = await apiGetShippingOptions({
          cart_items: cartItemsForApi,
          address_api: {
            // Pastikan backend Anda menerima ID ini
            kecamatan_id: selectedAlamat.api_kecamatan_id,
            kelurahan_id: selectedAlamat.api_kelurahan_id,
          }
        });
        setShippingOptions(data.seller_options);
      } catch (error) {
        console.error('Gagal memuat opsi pengiriman:', error);
        toast.error('Gagal memuat opsi pengiriman.');
      } finally {
        setLoadingShipping(false);
      }
    };

    const debounceTimer = setTimeout(fetchShippingOptions, 300); // Debounce
    return () => clearTimeout(debounceTimer);

  }, [selectedAlamat, cart]);

  // Handler saat memilih alamat
  const handleAlamatChange = (e) => {
    const alamatId = parseInt(e.target.value, 10);
    const alamat = alamatList.find(a => a.id === alamatId);
    setSelectedAlamat(alamat);
  };

  // Handler saat memilih opsi pengiriman
  const handleShippingChange = (sellerId, option) => {
    setSelectedShipping(prev => ({
      ...prev,
      [sellerId]: option
    }));
  };

  // 2. Modifikasi fungsi handlePlaceOrder
  const handlePlaceOrder = async () => {
    // Validasi
    if (!selectedAlamat) {
      toast.error('Silakan pilih alamat pengiriman.');
      return;
    }
    if (!isOrderReady) {
      toast.error('Silakan pilih metode pengiriman untuk semua toko.');
      return;
    }
    // Cegah klik ganda
    if (loadingOrder) return;

    setLoadingOrder(true); // Set loading true
    
    try {
      // Siapkan data untuk API
      const sellerShippingChoices = {};
      Object.keys(selectedShipping).forEach(sellerId => {
        const option = selectedShipping[sellerId];
        sellerShippingChoices[sellerId] = {
          metode: option.metode,
          harga: option.harga,
        };
      });

      const cartItemsForApi = cart.map(item => ({
        product_id: item.productId,
        variation_id: item.variation?.id || 0,
        quantity: item.quantity,
        price: item.price,
        seller_id: item.sellerId, // Pastikan sellerId ada di cartStore
      }));

      const orderData = {
        cart_items: cartItemsForApi,
        shipping_address_id: selectedAlamat.id,
        seller_shipping_choices: sellerShippingChoices,
        payment_method: paymentMethod,
      };

      // Panggil API
      const order = await apiCreateOrder(orderData); // Memanggil api.js

      // Sukses
      toast.success('Pesanan berhasil dibuat!');
      clearCart();
      // Arahkan ke halaman detail pesanan
      router.push(`/pesanan/${order.order_id}`); // Sesuaikan dengan respons API Anda

    } catch (error) {
      console.error('Gagal membuat pesanan:', error);
      // Tampilkan error ke pengguna
      toast.error(error.message || 'Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoadingOrder(false); // Set loading false
    }
  };


  if (loadingAlamat) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Kolom Kiri: Alamat & Pengiriman */}
          <div>
            {/* --- Pemilihan Alamat --- */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
              {alamatList.length > 0 ? (
                <select 
                  className="w-full p-2 border rounded-lg"
                  value={selectedAlamat?.id || ''}
                  onChange={handleAlamatChange}
                >
                  <option value="" disabled>Pilih Alamat</option>
                  {alamatList.map(alamat => (
                    <option key={alamat.id} value={alamat.id}>
                      {alamat.nama_penerima} - {alamat.alamat_lengkap}, {alamat.kelurahan}, {alamat.kecamatan}
                    </option>
                  ))}
                </select>
              ) : (
                <p>Anda belum memiliki alamat. Silakan tambahkan di halaman Akun.</p>
              )}
            </div>

            {/* --- Opsi Pengiriman per Toko --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Opsi Pengiriman</h2>
              {loadingShipping && <p>Menghitung opsi pengiriman...</p>}
              
              {!loadingShipping && !shippingOptions && selectedAlamat && (
                <p className="text-gray-500">Opsi pengiriman akan muncul di sini.</p>
              )}

              {!loadingShipping && shippingOptions && Object.keys(shippingOptions).map(sellerId => {
                const sellerData = shippingOptions[sellerId];
                return (
                  <div key={sellerId} className="mb-4 border-b pb-4">
                    <h3 className="font-semibold text-gray-800">Pesanan dari: {sellerData.nama_toko}</h3>
                    {sellerData.options.length > 0 ? (
                      sellerData.options.map((option, index) => (
                        <div key={index} className="flex items-center mt-2">
                          <input 
                            type="radio"
                            name={`shipping_${sellerId}`}
                            id={`shipping_${sellerId}_${index}`}
                            value={option.metode}
                            checked={selectedShipping[sellerId]?.metode === option.metode}
                            onChange={() => handleShippingChange(sellerId, option)}
                            className="mr-2"
                          />
                          <label htmlFor={`shipping_${sellerId}_${index}`} className="flex justify-between w-full">
                            <span>{option.nama}</span>
                            <span className="font-medium">{option.harga !== null ? `Rp ${formatCurrency(option.harga)}` : 'N/A'}</span>
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-500">Tidak ada opsi pengiriman ke alamat Anda.</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Pesanan */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
              
              {/* Daftar Item (Ringkas) */}
              <div className="max-h-60 overflow-y-auto mb-4 border-b pb-4">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">{item.name} <span className="text-gray-600">x {item.quantity}</span></pre>
                      <p className="text-sm text-gray-500">{item.toko?.nama_toko}</p>
                    </div>
                    <p className="text-gray-700">Rp {formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal Produk</span>
                  <span className="font-medium">Rp {formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ongkir</span>
                  <span className="font-medium">Rp {formatCurrency(totalShipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Total Bayar</span>
                  <span>Rp {formatCurrency(totalPrice + totalShipping)}</span>
                </div>
              </div>
              
              {/* Tombol Buat Pesanan */}
              <div className="mt-6">
                <button
                  onClick={handlePlaceOrder}
                  // 3. Update tombol disabled dan teks
                  disabled={!isOrderReady || loadingAlamat || loadingShipping || loadingOrder}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400"
                >
                  {loadingAlamat ? 'Memuat Alamat...' : 
                   loadingShipping ? 'Menghitung Ongkir...' :
                   loadingOrder ? 'Memproses Pesanan...' : 
                   `Buat Pesanan (Rp ${formatCurrency(totalPrice + totalShipping)})`}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

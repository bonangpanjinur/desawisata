// src/pages/checkout.js
// PERBAIKAN: Mengubah impor default 'useCartStore' dan 'useAuthStore' menjadi impor bernama.
// import useCartStore from '@/store/cartStore'; // <-- INI SALAH
// import useAuthStore from '@/store/authStore'; // <-- INI SALAH
import { useCartStore } from '@/store/cartStore'; // <-- INI BENAR
import { useAuthStore } from '@/store/authStore'; // <-- INI BENAR

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { apiGetAlamat, apiGetShippingOptions, apiCreateOrder } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast'; 
import LoadingSpinner from '@/components/LoadingSpinner'; 

export default function CheckoutPage() {
  const router = useRouter();
  // 'useCartStore' dan 'useAuthStore' sekarang adalah fungsi yang benar
  const { cart, getTotalPrice, clearCart, getCartGroupedBySeller } = useCartStore();
  const { user, token } = useAuthStore();
  
  const [alamatList, setAlamatList] = useState([]);
  const [selectedAlamat, setSelectedAlamat] = useState(null);
  const [shippingOptions, setShippingOptions] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('transfer_bank');
  
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const groupedCart = useMemo(() => getCartGroupedBySeller(), [cart, getCartGroupedBySeller]);

  // 1. Redirect jika belum login atau keranjang kosong
  useEffect(() => {
    if (!token) {
      toast.error("Anda harus login untuk checkout.");
      router.push('/akun?redirect=/checkout');
      return; // Tambahkan return agar tidak menjalankan kode di bawahnya
    }
    // Cek keranjang HANYA jika 'loadingOrder' false
    if (cart.length === 0 && !loadingOrder) { 
      toast.error("Keranjang Anda kosong.");
      router.push('/keranjang');
    }
  }, [token, cart, loadingOrder, router]);

  // 2. Ambil alamat pengguna
  useEffect(() => {
    if (token) {
      const fetchAlamat = async () => {
        setLoadingAddress(true);
        try {
          const data = await apiGetAlamat();
          setAlamatList(data.addresses || []);
          if (data.default_address_id) {
            const defaultAlamat = data.addresses.find(a => a.id === data.default_address_id);
            setSelectedAlamat(defaultAlamat || data.addresses[0] || null);
          } else {
            setSelectedAlamat(data.addresses[0] || null);
          }
        } catch (err) {
          console.error("Gagal memuat alamat:", err);
          toast.error(`Gagal memuat alamat: ${err.message}`);
        } finally {
          setLoadingAddress(false);
        }
      };
      fetchAlamat();
    }
  }, [token]);

  // 3. Hitung ongkir setiap kali alamat atau keranjang berubah
  useEffect(() => {
    if (!selectedAlamat || cart.length === 0) {
      setShippingOptions({});
      return;
    }

    const fetchShippingOptions = async () => {
      setLoadingShipping(true);
      try {
        const cartItemsForApi = cart.map(item => ({
          product_id: item.productId,
          seller_id: item.sellerId,
        }));
        
        const addressApiData = {
          provinsi_id: selectedAlamat.api_provinsi_id,
          kabupaten_id: selectedAlamat.api_kabupaten_id,
          kecamatan_id: selectedAlamat.api_kecamatan_id,
          kelurahan_id: selectedAlamat.api_kelurahan_id,
        };

        const data = await apiGetShippingOptions({
          cart_items: cartItemsForApi,
          address_api: addressApiData,
        });
        
        setShippingOptions(data.seller_options || {});

      } catch (err) {
        console.error("Gagal hitung ongkir:", err);
        toast.error(`Gagal menghitung ongkir: ${err.message}`);
        setShippingOptions({}); 
      } finally {
        setLoadingShipping(false);
      }
    };

    fetchShippingOptions();
  }, [cart, selectedAlamat]);

  // 4. Hitung total (termasuk ongkir)
  const { totalShipping, totalGrand, sellerShippingChoices } = useMemo(() => {
    let totalShipping = 0;
    const choices = {};
    const sellerIds = Object.keys(groupedCart);
    const productTotal = getTotalPrice(); // Ambil total produk

    if (sellerIds.length === 0 || Object.keys(shippingOptions).length === 0) {
      return { totalShipping: 0, totalGrand: productTotal, sellerShippingChoices: {} };
    }

    for (const sellerId of sellerIds) {
      const optionsForSeller = shippingOptions[sellerId]?.options;
      if (optionsForSeller && optionsForSeller.length > 0) {
        const sortedOptions = [...optionsForSeller].sort((a, b) => {
          if (a.metode === 'tidak_tersedia') return 1;
          if (b.metode === 'tidak_tersedia') return -1;
          return (a.harga || 0) - (b.harga || 0);
        });
        
        const cheapestOption = sortedOptions[0];
        
        if (cheapestOption.metode !== 'tidak_tersedia' && cheapestOption.harga !== null) {
          totalShipping += cheapestOption.harga;
          choices[sellerId] = {
            metode: cheapestOption.metode,
            harga: cheapestOption.harga,
          };
        } else {
          choices[sellerId] = { metode: 'tidak_tersedia', harga: null };
        }
      }
    }
    
    return { 
      totalShipping, 
      totalGrand: productTotal + totalShipping, 
      sellerShippingChoices: choices 
    };
  }, [groupedCart, shippingOptions, getTotalPrice]);

  // 5. Cek kesiapan order
  const isOrderReady = () => {
    if (!selectedAlamat || loadingAddress || loadingShipping || loadingOrder) return false;
    // Cek jika cart ada tapi pilihan ongkir belum ada
    if (cart.length > 0 && Object.keys(sellerShippingChoices).length === 0) return false;
    // Cek jika ada seller yang tidak punya opsi pengiriman
    return Object.values(sellerShippingChoices).every(choice => choice.metode !== 'tidak_tersedia');
  };

  // 6. Fungsi Buat Pesanan
  const handlePlaceOrder = async () => {
    if (!isOrderReady()) {
      toast.error("Pastikan alamat dan opsi pengiriman sudah lengkap.");
      return;
    }

    setLoadingOrder(true);
    
    const cartItemsForApi = cart.map(item => ({
      product_id: item.productId,
      variation_id: item.variation?.id || 0,
      quantity: item.quantity,
      price: item.price,
      seller_id: item.sellerId,
    }));

    const orderData = {
      cart_items: cartItemsForApi,
      shipping_address_id: selectedAlamat.id,
      seller_shipping_choices: sellerShippingChoices,
      payment_method: paymentMethod,
    };

    try {
      const data = await apiCreateOrder(orderData);
      
      toast.success('Pesanan berhasil dibuat! Mengalihkan ke halaman pembayaran...');
      clearCart();
      router.push(`/pesanan/${data.order_id}`);

    } catch (err) {
      console.error("Gagal membuat pesanan:", err);
      toast.error(`Gagal membuat pesanan: ${err.message}`);
      setLoadingOrder(false); 
    } 
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl p-4 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Checkout</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kolom Kiri: Alamat & Pengiriman */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
              {loadingAddress ? (
                <LoadingSpinner />
              ) : alamatList.length > 0 ? (
                <select 
                  value={selectedAlamat?.id || ''}
                  onChange={(e) => setSelectedAlamat(alamatList.find(a => a.id == e.target.value))}
                  className="w-full p-2 border rounded-md"
                >
                  {alamatList.map(alamat => (
                    <option key={alamat.id} value={alamat.id}>
                      {alamat.nama_penerima} - {alamat.alamat_lengkap}, {alamat.kelurahan}, {alamat.kecamatan}, {alamat.kabupaten}
                    </option>
                  ))}
                </select>
              ) : (
                <p>Anda belum memiliki alamat. <button onClick={() => router.push('/akun?tab=alamat')} className="text-blue-600 hover:underline">Tambah Alamat</button></p>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Opsi Pengiriman</h2>
              {loadingShipping ? (
                <LoadingSpinner />
              ) : (
                <div className="space-y-4">
                  {Object.keys(groupedCart).map(sellerId => {
                    const seller = groupedCart[sellerId];
                    const options = shippingOptions[sellerId]?.options || [];
                    const selectedChoice = sellerShippingChoices[sellerId];

                    return (
                      <div key={sellerId}>
                        <h3 className="font-semibold">{seller.nama_toko}</h3>
                        {options.length > 0 ? (
                          options.map(opt => (
                            <div key={opt.metode} className="flex justify-between items-center text-sm ml-2">
                              <span>
                                <input 
                                  type="radio" 
                                  name={`shipping_${sellerId}`} 
                                  value={opt.metode}
                                  checked={selectedChoice?.metode === opt.metode}
                                  onChange={() => {
                                    // Pilihan manual ongkir bisa ditambahkan di sini
                                  }}
                                  disabled // Nonaktifkan pilihan manual
                                  className="mr-2"
                                />
                                {opt.nama}
                              </span>
                              <span className={opt.harga === null ? 'text-red-600' : ''}>
                                {opt.harga === null ? 'Tidak Tersedia' : `Rp ${formatCurrency(opt.harga)}`}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 ml-2">Menghitung ongkir...</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan & Pembayaran */}
          <div>
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Ringkasan Pesanan</h2>
              
              <div className="mb-4 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium">{item.name} <span className="text-gray-600">x {item.quantity}</span></p>
                      <p className="text-sm text-gray-500">{item.toko?.nama_toko}</p>
                    </div>
                    <p className="text-gray-700">Rp {formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span>Rp {formatCurrency(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Ongkos Kirim</span>
                  <span>{loadingShipping ? '...' : `Rp ${formatCurrency(totalShipping)}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Total Pembayaran</span>
                  <span>{loadingShipping ? '...' : `Rp ${formatCurrency(totalGrand)}`}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loadingAddress || loadingShipping || loadingOrder || !isOrderReady()}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg mt-6 hover:bg-primary-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loadingOrder ? (
                  <span className="flex items-center justify-center">
                    <LoadingSpinner /> Memproses Pesanan...
                  </span>
                ) : loadingShipping ? (
                  'Menghitung Ongkir...'
                ) : loadingAddress ? (
                  'Memuat Alamat...'
                ) : (
                  'Buat Pesanan'
                )}
              </button>
              
              {!isOrderReady() && !loadingAddress && !loadingShipping && !loadingOrder && cart.length > 0 && (
                <p className="text-red-600 text-sm mt-2 text-center">
                  Tidak dapat melanjutkan. Pastikan alamat dipilih dan pengiriman tersedia untuk semua toko.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

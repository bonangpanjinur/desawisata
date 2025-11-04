// src/pages/checkout.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { apiFetch } from '@/lib/api';
import { IconCheckCircle } from '@/components/icons';

// Komponen Alamat (Form + Tampilan)
function AlamatForm({ alamat, setAlamat }) {
  // TODO: Ambil data provinsi dari API
  // const [provinsi, setProvinsi] = useState([]);
  // const [kabupaten, setKabupaten] = useState([]);
  // ... dst

  if (alamat) {
    return (
      <div className="rounded-lg border border-green-300 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-green-800">Alamat Pengiriman</h3>
          <button onClick={() => setAlamat(null)} className="text-sm font-semibold text-primary hover:underline">
            Ubah Alamat
          </button>
        </div>
        <p className="mt-2 text-gray-700">{alamat.alamat_lengkap}</p>
        <p className="text-gray-700">{alamat.kecamatan_nama}, {alamat.kabupaten_nama}</p>
        <p className="text-gray-700">{alamat.provinsi_nama}</p>
      </div>
    );
  }

  // Form untuk mengisi alamat baru
  // Ini adalah versi sederhana, idealnya menggunakan dropdown dinamis
  return (
    <>
      <p className="text-red-500 text-sm mb-2">Fitur alamat belum lengkap. Harap gunakan alamat default Anda.</p>
      {/* <input type="text" placeholder="Alamat Lengkap" className="..."/>
        ... dropdown provinsi, kab, kec ...
      */}
      <button 
        disabled 
        className="rounded-lg bg-gray-300 px-5 py-2 text-white cursor-not-allowed"
      >
        Simpan Alamat (Demo)
      </button>
    </>
  );
}

// Komponen Pilihan Ongkir
function ShippingOptions({ tokoId, namaToko, options, selected, onSelect }) {
  if (!options || options.length === 0) {
    return <p className="text-red-500">Tidak ada opsi pengiriman ke alamat Anda.</p>;
  }
  
  return (
    <div className="rounded-lg border bg-white shadow-sm mb-4">
      <h3 className="p-4 font-semibold border-b">{namaToko}</h3>
      <div className="p-4 space-y-3">
        {options.map(opt => (
          <label
            key={opt.metode}
            className={`flex justify-between items-center rounded-lg border p-3 cursor-pointer ${
              selected === opt.metode ? 'border-primary ring-2 ring-primary' : 'border-gray-300'
            }`}
          >
            <div>
              <p className="font-semibold">{opt.nama}</p>
              <p className="text-sm text-gray-500">
                {opt.harga === 0 ? 'Gratis' : `Rp ${opt.harga.toLocaleString('id-ID')}`}
              </p>
            </div>
            <input
              type="radio"
              name={`shipping-${tokoId}`}
              value={opt.metode}
              checked={selected === opt.metode}
              onChange={() => onSelect(tokoId, opt.metode)}
              className="form-radio h-5 w-5 text-primary"
            />
          </label>
        ))}
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, total, clearCart } = useCartStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [alamat, setAlamat] = useState(null);
  const [shippingOptions, setShippingOptions] = useState(null);
  const [shippingChoices, setShippingChoices] = useState({}); // { tokoId: 'metode' }
  const [orderNotes, setOrderNotes] = useState('');
  const [error, setError] = useState(null);

  // 1. Cek Login & ambil alamat default
  useEffect(() => {
    if (!user) {
      router.replace('/akun?redirect=/checkout');
    } else {
      // Ambil profil user untuk alamat default
      apiFetch('/profile/me')
        .then(data => {
          if (data.shipping_address_default) {
            setAlamat(data.shipping_address_default);
          }
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [user, router]);

  // 2. Ambil Opsi Pengiriman jika keranjang & alamat berubah
  useEffect(() => {
    if (items.length > 0 && alamat) {
      setIsLoading(true);
      setError(null);
      
      const cart_items_simple = items.map(item => ({ product_id: item.product_id }));
      const address_api = {
        provinsi_id: alamat.provinsi_id,
        kabupaten_id: alamat.kabupaten_id,
        kecamatan_id: alamat.kecamatan_id,
        kelurahan_id: alamat.kelurahan_id,
      };

      apiFetch('/shipping-options', {
        method: 'POST',
        body: JSON.stringify({ cart_items: cart_items_simple, address_api }),
      })
      .then(data => {
        setShippingOptions(data.seller_options);
        // Set pilihan default (opsi pertama)
        const defaultChoices = {};
        for (const tokoId in data.seller_options) {
          if (data.seller_options[tokoId].options.length > 0) {
            defaultChoices[tokoId] = data.seller_options[tokoId].options[0].metode;
          }
        }
        setShippingChoices(defaultChoices);
      })
      .catch(err => setError('Gagal mengambil opsi pengiriman.'))
      .finally(() => setIsLoading(false));
    }
  }, [items, alamat]);

  // Hitung Total Akhir
  let totalOngkir = 0;
  if (shippingOptions) {
    for (const tokoId in shippingChoices) {
      const metode = shippingChoices[tokoId];
      const option = shippingOptions[tokoId]?.options.find(o => o.metode === metode);
      if (option) {
        totalOngkir += option.harga;
      }
    }
  }
  const totalAkhir = total + totalOngkir;

  // Handle Buat Pesanan
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setError(null);
    
    // Validasi
    if (Object.keys(shippingChoices).length !== Object.keys(shippingOptions).length) {
      setError('Harap pilih metode pengiriman untuk semua toko.');
      setIsPlacingOrder(false);
      return;
    }

    try {
      const data = await apiFetch('/orders/create', {
        method: 'POST',
        body: JSON.stringify({
          shipping_address: alamat.alamat_lengkap,
          address_api: {
            provinsi_id: alamat.provinsi_id,
            kabupaten_id: alamat.kabupaten_id,
            kecamatan_id: alamat.kecamatan_id,
            kelurahan_id: alamat.kelurahan_id,
          },
          shipping_choices: shippingChoices,
          order_notes: orderNotes,
        }),
      });

      // Sukses
      clearCart();
      // Redirect ke halaman detail pesanan (jika 1 pesanan) atau halaman sukses
      const firstOrderId = data.order_ids[0];
      router.replace(`/pesanan/${firstOrderId}?success=true`);

    } catch (err) {
      setError(err.message);
      setIsPlacingOrder(false);
    }
  };


  if (!user) return <LoadingSpinner fullPage />;

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* 1. Alamat */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Alamat Pengiriman</h2>
            {isLoading && !alamat ? (
              <p>Memuat alamat...</p>
            ) : (
              <AlamatForm alamat={alamat} setAlamat={setAlamat} />
            )}
          </div>
          
          {/* 2. Opsi Pengiriman */}
          {alamat && (
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Opsi Pengiriman</h2>
              {isLoading && !shippingOptions ? (
                <LoadingSpinner />
              ) : (
                shippingOptions && Object.entries(shippingOptions).map(([tokoId, data]) => (
                  <ShippingOptions
                    key={tokoId}
                    tokoId={tokoId}
                    namaToko={data.nama_toko}
                    options={data.options}
                    selected={shippingChoices[tokoId]}
                    onSelect={(tokoId, metode) => {
                      setShippingChoices(prev => ({ ...prev, [tokoId]: metode }));
                    }}
                  />
                ))
              )}
            </div>
          )}

          {/* 3. Catatan */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <label htmlFor="order_notes" className="text-xl font-semibold">Catatan Pesanan (Opsional)</label>
            <textarea
              id="order_notes"
              rows="3"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="mt-4 w-full rounded-lg border border-gray-300 p-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Tinggalkan catatan untuk penjual..."
            ></textarea>
          </div>
        </div>

        {/* 4. Ringkasan Total */}
        <div className="md:col-span-1">
          <div className="sticky top-20 rounded-lg bg-white p-6 shadow-md">
            <h2 className="text-xl font-semibold border-b pb-4">Total Pesanan</h2>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between">
                <span>Total Produk</span>
                <span className="font-semibold">Rp {total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Ongkir</span>
                <span className="font-semibold">Rp {totalOngkir.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-4 mt-4">
                <span>Total Akhir</span>
                <span className="text-primary">Rp {totalAkhir.toLocaleString('id-ID')}</span>
              </div>
            </div>
            <button
              onClick={handlePlaceOrder}
              disabled={isLoading || isPlacingOrder || !alamat || !shippingOptions}
              className="mt-6 w-full rounded-lg bg-primary py-3 text-center text-lg font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPlacingOrder ? 'Memproses...' : 'Buat Pesanan'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}


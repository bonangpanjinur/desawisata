// src/pages/keranjang.js
// PERBAIKAN: 
// 1. Destructuring 'cart' (nama state yang benar) dari store, bukan 'items'.
// 2. Memastikan (cart || []).length digunakan untuk pengecekan.

import Layout from '@/components/Layout';
import { useCartStore } from '@/store/cartStore'; // PERBAIKAN: Impor bernama
import { IconX, IconPlus, IconMinus, IconCart } from '@/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils'; 

const placeholderImg = "https://placehold.co/100x100/f4f4f5/a1a1aa?text=Sadesa";

export default function KeranjangPage() {
  // PERBAIKAN: Destructuring 'cart' (nama state yang benar di cartStore.js)
  const { cart, getTotalPrice, removeItem, updateQuantity } = useCartStore();
  
  // Panggil selector untuk mendapatkan total
  const total = getTotalPrice(); 

  // Kelompokkan item berdasarkan toko
  // PERBAIKAN: Tambahkan (cart || []) untuk keamanan SSR dan gunakan state 'cart'
  const itemsByToko = (cart || []).reduce((acc, item) => {
    const tokoId = item.sellerId || 'toko-lain';
    if (!acc[tokoId]) {
      acc[tokoId] = {
        nama_toko: item.toko?.nama_toko || 'Toko Lain',
        items: [],
      };
    }
    acc[tokoId].items.push(item);
    return acc;
  }, {});

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Keranjang Belanja</h1>
      
      {/* PERBAIKAN: Gunakan (cart || []).length */}
      {(cart || []).length === 0 ? (
        <div className="text-center py-10">
          <IconCart className="mx-auto h-24 w-24 text-gray-300" />
          <p className="mt-4 text-lg text-gray-500">Keranjang Anda kosong.</p>
          <Link href="/jelajah" className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-dark">
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Daftar Item */}
          <div className="md:col-span-2 space-y-6">
            {Object.entries(itemsByToko).map(([tokoId, tokoData]) => (
              <div key={tokoId} className="rounded-lg bg-white shadow-md">
                <h2 className="border-b p-4 text-lg font-semibold">{tokoData.nama_toko}</h2>
                <div className="divide-y">
                  {tokoData.items.map(item => (
                    // Gunakan item.id (composite key) sebagai key
                    <div key={item.id} className="flex gap-4 p-4">
                      <Image
                        src={item.image || placeholderImg}
                        alt={item.name}
                        width={80}
                        height={80}
                        unoptimized={true} // PERBAIKAN: Tambahkan unoptimized
                        className="rounded-lg object-cover"
                        onError={(e) => e.target.src = placeholderImg}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.variation && (
                          <p className="text-sm text-gray-500">{item.variation.deskripsi}</p>
                        )}
                        <p className="mt-1 font-semibold text-primary">
                          {formatCurrency(item.price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        {/* Gunakan item.id untuk removeItem */}
                        <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                          <IconX className="h-5 w-5" />
                        </button>
                        <div className="flex items-center rounded-lg border">
                          {/* Gunakan updateQuantity */}
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 disabled:text-gray-300"
                            disabled={item.quantity <= 1}
                          >
                            <IconMinus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          {/* Gunakan updateQuantity */}
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 disabled:text-gray-300"
                          >
                            <IconPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan */}
          <div className="md:col-span-1">
            <div className="sticky top-20 rounded-lg bg-white p-6 shadow-md">
              <h2 className="text-xl font-semibold border-b pb-4">Ringkasan Belanja</h2>
              <div className="flex justify-between mt-4 text-lg">
                <span>Total Harga Produk</span>
                {/* Gunakan 'total' (dari getTotalPrice) */}
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Ongkos kirim akan dihitung saat checkout.</p>
              <Link href="/checkout" className="mt-6 block w-full rounded-lg bg-primary py-3 text-center text-lg font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark">
                Lanjut ke Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
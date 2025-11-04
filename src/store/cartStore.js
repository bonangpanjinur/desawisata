// src/store/cartStore.js
// PERBAIKAN: Menggunakan 'persist' untuk menyimpan keranjang otomatis
// dan menghapus fungsi hydrate manual.

import create from 'zustand';
import { persist } from 'zustand/middleware'; // 1. Impor persist

// 2. Bungkus 'create' dengan 'persist'
const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [], // State keranjang

      // Fungsi hydrate tidak lagi diperlukan, 'persist' menanganinya
      // hydrate: () => { ... } // DIHAPUS

      // Menambahkan produk ke keranjang
      addToCart: (product, variation, quantity) => {
        const item = {
          id: variation ? `${product.id}-${variation.id}` : product.id.toString(),
          productId: product.id,
          name: product.nama_produk,
          price: variation ? parseFloat(variation.harga) : parseFloat(product.harga_dasar),
          quantity: parseInt(quantity, 10),
          image: product.gambar_unggulan?.thumbnail || product.galeri_foto?.[0]?.thumbnail || "https://placehold.co/100x100/f4f4f5/a1a1aa?text=Sadesa",
          variation: variation ? { id: variation.id, deskripsi: variation.deskripsi } : null,
          sellerId: product.toko?.id_pedagang, // Pastikan ID pedagang ada di sini
          toko: product.toko // Simpan info toko
        };

        set((state) => {
          const existingItemIndex = state.cart.findIndex((i) => i.id === item.id);
          let newCart = [...state.cart];

          if (existingItemIndex > -1) {
            // Update kuantitas jika item sudah ada
            newCart[existingItemIndex].quantity += item.quantity;
          } else {
            // Tambah item baru
            newCart.push(item);
          }
          
          // 'persist' akan otomatis menyimpan newCart ke localStorage
          return { cart: newCart };
        });
      },

      // Menghapus produk dari keranjang
      removeFromCart: (itemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        }));
      },

      // Mengubah kuantitas
      updateQuantity: (itemId, quantity) => {
        const newQuantity = parseInt(quantity, 10);
        if (newQuantity <= 0) {
          // Hapus item jika kuantitas 0 atau kurang
          get().removeFromCart(itemId);
        } else {
          set((state) => ({
            cart: state.cart.map((item) =>
              item.id === itemId ? { ...item, quantity: newQuantity } : item
            ),
          }));
        }
      },

      // Mengosongkan keranjang
      clearCart: () => {
        set({ cart: [] });
      },

      // Getter untuk total item (count)
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      // Getter untuk total harga
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Getter untuk mengelompokkan keranjang per penjual
      getCartGroupedBySeller: () => {
        return get().cart.reduce((acc, item) => {
          const sellerId = item.sellerId || 'toko_tidak_dikenal';
          if (!acc[sellerId]) {
            acc[sellerId] = {
              toko: item.toko || { nama_toko: 'Toko Tidak Dikenal' },
              items: [],
            };
          }
          acc[sellerId].items.push(item);
          return acc;
        }, {});
      },
    }),
    {
      name: 'cart-storage', // Nama key di localStorage
    }
  )
);

export default useCartStore;

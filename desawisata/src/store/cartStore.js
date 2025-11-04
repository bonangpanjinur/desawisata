// File: src/store/cartStore.js
// VERSI LENGKAP
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Array untuk menyimpan item: { id, name, price, quantity, image, variation_name, seller_id, nama_toko }

      /**
       * Menambah item ke keranjang
       * @param {object} product - Objek produk lengkap
       * @param {object|null} variation - Objek variasi (jika ada)
       * @param {number} quantity - Jumlah yang ditambahkan
       */
      addItem: (product, variation, quantity) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          (item) => item.id === product.id && item.variation_id === (variation ? variation.id : null)
        );

        let newItems = [...items];

        if (existingItemIndex > -1) {
          // Item sudah ada, update quantity
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: newItems[existingItemIndex].quantity + quantity,
          };
        } else {
          // Item baru
          newItems.push({
            id: product.id, // product_id
            product_id: product.id, // duplikat untuk checkout
            name: product.nama_produk,
            price: variation ? variation.harga : product.harga,
            quantity: quantity,
            image: (product.gambar_produk && product.gambar_produk[0]) ? product.gambar_produk[0] : 'https://placehold.co/100x100?text=Produk',
            variation_id: variation ? variation.id : null,
            variation_name: variation ? variation.nama_variasi : null,
            // PENTING: Pastikan data ini ada di 'product' saat addItem dipanggil
            seller_id: product.pedagang_id, 
            nama_toko: product.nama_toko,
          });
        }

        set({ items: newItems });
      },

      /**
       * Menghapus item dari keranjang
       * @param {number} id - ID Produk
       * @param {number|null} variation_id - ID Variasi
       */
      removeItem: (id, variation_id) => {
        const { items } = get();
        const newItems = items.filter(
          (item) => !(item.id === id && item.variation_id === variation_id)
        );
        set({ items: newItems });
      },

      /**
       * Update kuantitas item di keranjang
       * @param {number} id - ID Produk
       * @param {number|null} variation_id - ID Variasi
       * @param {number} quantity - Kuantitas baru
       */
      updateItemQuantity: (id, variation_id, quantity) => {
        const { items } = get();
        const newItems = items.map((item) => {
          if (item.id === id && item.variation_id === variation_id) {
            return { ...item, quantity: Math.max(1, quantity) }; // Pastikan minimal 1
          }
          return item;
        });
        set({ items: newItems });
      },

      /**
       * Mengosongkan keranjang (setelah checkout)
       */
      clearCart: () => {
        set({ items: [] });
      },

      /**
       * Menghitung total item (bukan total kuantitas)
       */
      getTotalItems: () => {
        const { items } = get();
        // Menghitung jumlah kuantitas semua item
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Menghitung total harga
       */
      getTotalPrice: () => {
         const { items } = get();
         return items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
      
    }),
    {
      name: 'cart-storage', // Nama key di localStorage
      storage: createJSONStorage(() => localStorage), // Gunakan localStorage
    }
  )
);


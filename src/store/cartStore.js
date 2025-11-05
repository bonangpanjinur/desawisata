/**
 * LOKASI FILE: src/store/cartStore.js
 * PERBAIKAN: 
 * 1. Mengubah `export default` menjadi `export const`.
 * 2. Mengganti nama state dari 'items' menjadi 'cart'.
 * 3. Menambahkan null check ( `(cart || []).reduce` ) untuk keamanan SSR.
 * 4. Menambahkan `toast.error` pada `debouncedSyncCart`.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiSyncMyCart } from '@/lib/api'; 
import { useAuthStore } from './authStore'; 
import { toast } from 'react-hot-toast'; 

// Helper untuk debounce (menunda eksekusi)
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Buat fungsi debounced untuk sinkronisasi
const debouncedSyncCart = debounce(async (cart) => {
  if (!cart) return; // Tambahan keamanan
  const { token } = useAuthStore.getState();
  // Hanya sync jika login 
  if (token) { 
    try {
      console.log("Debounced sync running...", cart);
      await apiSyncMyCart(cart); 
    } catch (error) {
      console.error("Gagal sinkronisasi keranjang (debounced):", error);
      // PERBAIKAN: Tampilkan error ke user
      toast.error(`Gagal sinkronisasi keranjang: ${error.message}`);
    }
  }
}, 1500); 

export const useCartStore = create( // PERBAIKAN: 'export const'
  persist(
    (set, get) => ({
      cart: [], // PERBAIKAN: Ganti nama state menjadi 'cart'
      
      // Aksi untuk menambah item
      addItem: (product, variation = null, quantity = 1) => {
        const item = {
          id: variation ? `${product.id}_${variation.id}` : `${product.id}_0`,
          productId: product.id,
          name: product.nama_produk,
          price: variation ? variation.harga_variasi : product.harga_dasar,
          quantity,
          image: product.gambar_unggulan?.thumbnail || product.galeri_foto?.[0]?.thumbnail || 'https://placehold.co/100x100/f4f4f5/a1a1aa?text=Sadesa',
          variation: variation ? { id: variation.id, deskripsi: variation.deskripsi } : null,
          toko: product.toko, 
          sellerId: product.toko.id_pedagang, 
        };

        const existingItem = get().cart.find((i) => i.id === item.id);
        
        let newCart;
        if (existingItem) {
          newCart = get().cart.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          newCart = [...get().cart, item];
        }
        
        set({ cart: newCart });
        debouncedSyncCart(newCart); // Panggil debounced sync
      },
      
      // Aksi untuk menghapus item
      removeItem: (itemId) => {
        const newCart = get().cart.filter((i) => i.id !== itemId);
        set({ cart: newCart });
        debouncedSyncCart(newCart); // Panggil debounced sync
      },
      
      // Aksi untuk update kuantitas
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId); // Hapus jika kuantitas 0
        } else {
          const newCart = get().cart.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          );
          set({ cart: newCart });
          debouncedSyncCart(newCart); // Panggil debounced sync
        }
      },
      
      // Aksi untuk mengosongkan keranjang
      clearCart: () => {
        set({ cart: [] });
        debouncedSyncCart([]); // Sync keranjang kosong
      },

      // Fungsi helper
      // PERBAIKAN: Tambahkan '(cart || [])' untuk mengatasi error prerender
      getTotalPrice: () => {
        const cart = get().cart;
        return (cart || []).reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        const cart = get().cart;
        return (cart || []).reduce((total, item) => total + item.quantity, 0);
      },

      getCartGroupedBySeller: () => {
        const cart = get().cart;
        return (cart || []).reduce((acc, item) => {
          const sellerId = item.sellerId || 'toko_lain';
          if (!acc[sellerId]) {
            acc[sellerId] = {
              nama_toko: item.toko?.nama_toko || 'Toko Lain',
              items: [],
            };
          }
          acc[sellerId].items.push(item);
          return acc;
        }, {}) || {}; // Kembalikan objek kosong jika cart undefined
      },
    }),
    {
      name: 'cart-storage', 
    }
  )
);
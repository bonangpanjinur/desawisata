/**
 * LOKASI FILE: src/store/cartStore.js
 * PERUBAHAN: 
 * 1. Mengembalikan ke `export const` (bukan default).
 * 2. Menambahkan null check ( `cart?.reduce` ) di helper.
 * 3. Menambahkan `toast.error` pada `debouncedSyncCart` agar error
 * sinkronisasi di latar belakang terlihat oleh user.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiSyncMyCart } from '@/lib/api'; 
import { useAuthStore } from './authStore'; 
import { toast } from 'react-hot-toast'; // Impor toast

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
  if (token && cart.length > 0) { 
    try {
      await apiSyncMyCart(cart); 
    } catch (error) {
      console.error("Gagal sinkronisasi keranjang (debounced):", error);
      // PERUBAHAN: Tampilkan error ke user
      toast.error(`Gagal sinkronisasi keranjang: ${error.message}`);
    }
  }
}, 1500); 

export const useCartStore = create( // PERBAIKAN: 'export const'
  persist(
    (set, get) => ({
      cart: [],
      
      // Aksi untuk menambah item
      addItem: (product, variation = null, quantity = 1) => {
        const item = {
          id: variation ? `${product.id}_${variation.id}` : `${product.id}_0`,
          productId: product.id,
          name: product.nama_produk,
          price: variation ? variation.harga_variasi : product.harga_dasar,
          quantity,
          image: product.gambar_unggulan?.thumbnail || product.galeri_foto?.[0]?.thumbnail || '/placeholder.png',
          variation: variation ? { id: variation.id, deskripsi: variation.deskripsi_variasi } : null,
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
      },

      // Fungsi helper
      // PERBAIKAN: Tambahkan 'cart?' untuk mengatasi error prerender
      getTotalPrice: () => {
        return get().cart?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
      },
      
      getTotalItems: () => {
        return get().cart?.reduce((total, item) => total + item.quantity, 0) || 0;
      },

      getCartGroupedBySeller: () => {
        return get().cart?.reduce((acc, item) => {
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

// Hapus 'export default'
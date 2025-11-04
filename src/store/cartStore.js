/**
 * LOKASI FILE: src/store/cartStore.js
 * PERBAIKAN: Mengubah 'export default' menjadi 'export const' agar sesuai
 * dengan cara file ini diimpor di komponen lain (seperti Header.js).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiSyncMyCart } from '@/lib/api'; // Import API
import { useAuthStore } from './authStore'; // PERBAIKAN: Impor bernama

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
  const { token } = useAuthStore.getState();
  if (token && cart.length > 0) { // Hanya sync jika login dan keranjang tidak kosong
    try {
      // console.log("Debounced Sync: Menyimpan keranjang ke server...", cart);
      await apiSyncMyCart(cart); // Cukup kirim, tidak perlu menunggu balasan
    } catch (error) {
      console.error("Gagal sinkronisasi keranjang (debounced):", error);
    }
  }
}, 1500); // Tunda 1.5 detik setelah aksi terakhir

export const useCartStore = create( // PERBAIKAN: Menjadi 'export const'
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
          toko: product.toko, // Simpan info toko
          sellerId: product.toko.id_pedagang, // Simpan ID pedagang
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
        // Tidak perlu panggil debouncedSyncCart, karena authStore akan panggil apiClearMyCart
      },

      // Fungsi helper
      getTotalPrice: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getTotalItems: () => {
        return get().cart.reduce((total, item) => total + item.quantity, 0);
      },

      getCartGroupedBySeller: () => {
        return get().cart.reduce((acc, item) => {
          const sellerId = item.sellerId || 'toko_lain';
          if (!acc[sellerId]) {
            acc[sellerId] = {
              nama_toko: item.toko?.nama_toko || 'Toko Lain',
              items: [],
            };
          }
          acc[sellerId].items.push(item);
          return acc;
        }, {});
      },
    }),
    {
      name: 'cart-storage', // nama key di localStorage
    }
  )
);

// Hapus 'export default'


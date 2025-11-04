/**
 * LOKASI FILE: src/store/authStore.js
 * PERBAIKAN: Mengembalikan ke `export const` (bukan default)
 * agar sesuai dengan impor di file lain.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiSyncMyCart, apiClearMyCart, apiGetMyCart } from '@/lib/api';
import { useCartStore } from './cartStore'; // Impor bernama

export const useAuthStore = create( // PERBAIKAN: 'export const'
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: async (username, password) => {
        try {
          const data = await apiLogin(username, password);
          set({ user: data.user_data, token: data.token });

          // Sinkronisasi Keranjang setelah login
          const guestCart = useCartStore.getState().cart;
          if (guestCart.length > 0) {
            console.log("Menyinkronkan keranjang guest ke server...", guestCart);
            const syncedCart = await apiSyncMyCart(guestCart);
            useCartStore.setState({ cart: syncedCart });
          } else {
            const serverCart = await apiGetMyCart();
            useCartStore.setState({ cart: serverCart });
          }
          return data;
        } catch (error) {
          throw new Error(error.response?.data?.message || error.message);
        }
      },
      
      register: async (username, email, password, nama_lengkap) => {
        try {
          const data = await apiRegister(username, email, password, nama_lengkap);
          return data;
        } catch (error) {
          throw new Error(error.response?.data?.message || error.message);
        }
      },
      
      logout: async () => {
        try {
          await apiClearMyCart();
        } catch (error) {
          console.error("Gagal membersihkan keranjang server saat logout:", error);
        } finally {
          useCartStore.setState({ cart: [] });
          set({ user: null, token: null });
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('auth-storage');
        }
      },
    }),
    {
      name: 'auth-storage', 
    }
  )
);

// Hapus 'export default'


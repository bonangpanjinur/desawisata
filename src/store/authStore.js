/**
 * LOKASI FILE: src/store/authStore.js
 * PERBAIKAN: Mengubah 'export default' menjadi 'export const' agar sesuai
 * dengan cara file ini diimpor di komponen lain (seperti Header.js).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiSyncMyCart, apiClearMyCart, apiGetMyCart } from '@/lib/api';
import { useCartStore } from './cartStore'; // PERBAIKAN: Impor bernama

export const useAuthStore = create( // PERBAIKAN: Menjadi 'export const'
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: async (username, password) => {
        try {
          const data = await apiLogin(username, password);
          set({ user: data.user_data, token: data.token });

          // LANGKAH 2: Sinkronisasi Keranjang setelah login
          const guestCart = useCartStore.getState().cart;
          if (guestCart.length > 0) {
            console.log("Menyinkronkan keranjang guest ke server...", guestCart);
            // Panggil API untuk sinkronisasi, gabungkan keranjang lokal dengan server
            const syncedCart = await apiSyncMyCart(guestCart);
            // Perbarui state cartStore dengan data dari server
            useCartStore.setState({ cart: syncedCart });
          } else {
            // Jika keranjang guest kosong, cukup ambil keranjang dari server
            const serverCart = await apiGetMyCart();
            useCartStore.setState({ cart: serverCart });
          }

          return data;
        } catch (error) {
          // Tangani error di level komponen (akun.js)
          throw new Error(error.response?.data?.message || error.message);
        }
      },
      
      register: async (username, email, password, nama_lengkap) => {
        try {
          const data = await apiRegister(username, email, password, nama_lengkap);
          return data;
        } catch (error) {
          // Tangani error di level komponen (akun.js)
          throw new Error(error.response?.data?.message || error.message);
        }
      },
      
      logout: async () => {
        try {
          // LANGKAH 3: Hapus keranjang di server
          await apiClearMyCart();
        } catch (error) {
          console.error("Gagal membersihkan keranjang server saat logout:", error);
          // Jangan hentikan proses logout meski gagal clear cart
        } finally {
          // Hapus keranjang lokal & data auth
          useCartStore.setState({ cart: [] });
          set({ user: null, token: null });
          // Hapus juga storage persist
          localStorage.removeItem('cart-storage');
          localStorage.removeItem('auth-storage');
        }
      },
    }),
    {
      name: 'auth-storage', // nama key di localStorage
    }
  )
);

// Hapus 'export default'


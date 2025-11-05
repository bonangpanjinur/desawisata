/**
 * LOKASI FILE: src/store/authStore.js
 * PERUBAHAN:
 * 1. Mengembalikan ke `export const` (bukan default). Ini adalah error kritis.
 * 2. Menyederhanakan block `catch` agar melemparkan error (yang sudah diproses
 * oleh interceptor di api.js) ke komponen/halaman.
 * 3. Menambahkan toast error pada `logout`.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiSyncMyCart, apiClearMyCart, apiGetMyCart } from '@/lib/api';
import { useCartStore } from './cartStore'; // Impor bernama
import { toast } from 'react-hot-toast'; // Impor toast

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
          const guestCart = useCartStore.getState().cart; // PERBAIKAN: Ganti 'items' ke 'cart'
          if (guestCart.length > 0) {
            console.log("Menyinkronkan keranjang guest ke server...", guestCart);
            const syncedCart = await apiSyncMyCart(guestCart);
            useCartStore.setState({ cart: syncedCart });
          } else {
            console.log("Mengambil keranjang server...");
            const serverCart = await apiGetMyCart();
            useCartStore.setState({ cart: serverCart });
          }
          return data; // Kembalikan data agar komponen tahu login sukses
        } catch (error) {
          // PERUBAHAN: Sederhanakan. Lemparkan error agar ditangkap oleh halaman.
          console.error("Login failed in authStore:", error);
          throw error;
        }
      },
      
      register: async (username, email, password, nama_lengkap) => {
        try {
          const data = await apiRegister(username, email, password, nama_lengkap);
          return data;
        } catch (error) {
          // PERUBAHAN: Sederhanakan. Lemparkan error agar ditangkap oleh halaman.
          console.error("Register failed in authStore:", error);
          throw error;
        }
      },
      
      logout: async () => {
        try {
          // Coba bersihkan keranjang di server
          await apiClearMyCart();
        } catch (error) {
          console.error("Gagal membersihkan keranjang server saat logout:", error);
          // PERUBAHAN: Tampilkan error ke user
          toast.error("Gagal membersihkan keranjang server saat logout.");
        } finally {
          // Selalu logout di client
          useCartStore.setState({ cart: [] });
          set({ user: null, token: null });
          // Hapus manual localStorage untuk kedua store
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
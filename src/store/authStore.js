/**
 * LOKASI FILE: src/store/authStore.js
 * PERBAIKAN:
 * 1. Mengubah `export default` menjadi `export const`.
 * 2. Menyederhanakan `catch` agar error dari interceptor bisa sampai ke halaman.
 * 3. Memperbaiki logika sinkronisasi keranjang.
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiLogin, apiRegister, apiSyncMyCart, apiClearMyCart, apiGetMyCart } from '@/lib/api';
import { useCartStore } from './cartStore'; // PERBAIKAN: Impor bernama
import { toast } from 'react-hot-toast'; 

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
          const guestCart = useCartStore.getState().cart; // PERBAIKAN: Ambil state 'cart'
          
          if (guestCart.length > 0) {
            console.log("Menyinkronkan keranjang guest ke server...", guestCart);
            // Kirim guest cart, server akan merge dan mengembalikan cart terbaru
            const syncedCart = await apiSyncMyCart(guestCart); 
            useCartStore.setState({ cart: syncedCart }); // Update store keranjang dengan data dari server
          } else {
            console.log("Mengambil keranjang server...");
            // Keranjang guest kosong, ambil keranjang dari server (jika ada)
            const serverCart = await apiGetMyCart();
            useCartStore.setState({ cart: serverCart });
          }
          return data; // Kembalikan data agar komponen tahu login sukses
        } catch (error) {
          // PERBAIKAN: Lemparkan error agar ditangkap oleh halaman.
          console.error("Login failed in authStore:", error);
          throw error;
        }
      },
      
      register: async (username, email, password, nama_lengkap) => {
        try {
          const data = await apiRegister(username, email, password, nama_lengkap);
          return data;
        } catch (error) {
          // PERBAIKAN: Lemparkan error agar ditangkap oleh halaman.
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
          // PERBAIKAN: Tampilkan error ke user
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
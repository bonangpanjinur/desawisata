// src/store/authStore.js
// PERBAIKAN: Menggunakan 'persist' untuk menyimpan state otomatis
// dan menghapus 'localStorage' manual serta fungsi hydrate.

import create from 'zustand';
import { persist } from 'zustand/middleware'; // 1. Impor persist
import { apiLogin, apiFetch } from '@/lib/api';

// 2. Bungkus 'create' dengan 'persist'
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,

      // Fungsi hydrate tidak lagi diperlukan, 'persist' menanganinya
      // hydrate: () => { ... } // DIHAPUS

      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const data = await apiLogin(username, password);
          if (data.token && data.user_data) {
            set({ user: data.user_data, token: data.token, loading: false });
            // 3. Hapus 'localStorage.setItem' manual
            // localStorage.setItem('token', data.token); // DIHAPUS
            // localStorage.setItem('user', JSON.stringify(data.user_data)); // DIHAPUS
            return true;
          }
          throw new Error('Data login tidak valid');
        } catch (error) {
          console.error("Login failed:", error);
          set({ loading: false, error: error.message });
          return false;
        }
      },

      logout: () => {
        set({ user: null, token: null });
        // 4. Hapus 'localStorage.removeItem' manual
        // localStorage.removeItem('token'); // DIHAPUS
        // localStorage.removeItem('user'); // DIHAPUS
        
        // Opsional: Hapus juga state keranjang saat logout
        // Jika Anda ingin keranjang juga kosong saat logout, tambahkan ini:
        // useCartStore.getState().clearCart();
      },

      // Fungsi untuk validasi token di server (opsional tapi bagus)
      validateToken: async () => {
        try {
          const data = await apiFetch('/auth/validate-token');
          // Jika token valid, server akan mengembalikan data user terbaru
          set({ user: data.user_data, loading: false });
        } catch (error) {
          // Jika token tidak valid (misal: expired), logout
          console.log("Token validation failed, logging out.");
          set({ user: null, token: null, loading: false });
        }
      }
    }),
    {
      name: 'auth-storage', // Nama key di localStorage
      // partialize: (state) => ({ token: state.token, user: state.user }), // Opsional: hanya simpan token dan user
    }
  )
);

export default useAuthStore;

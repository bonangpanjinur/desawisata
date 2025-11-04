// File: src/store/authStore.js
// PERBAIKAN: Menambahkan fungsi register, memperbaiki login, dan implementasi persist
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiLogin, apiRegister } from '@/lib/api'; // Impor fungsi API baru

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      
      /**
       * Menetapkan pengguna dan token ke state
       */
      setUser: (userData, authToken) => {
        set({ user: userData, token: authToken });
      },

      /**
       * Fungsi Login
       * PERBAIKAN: Menggunakan apiLogin yang baru
       */
      login: async (username, password) => {
        try {
          // Panggil apiLogin dari lib/api.js
          const data = await apiLogin(username, password);
          if (data.token && data.user_data) {
            set({ user: data.user_data, token: data.token });
            return data;
          }
          throw new Error(data.message || 'Data login tidak valid');
        } catch (error) {
          console.error("Login Gagal di Store:", error);
          throw error; // Lempar error agar bisa ditangkap UI
        }
      },

      /**
       * Fungsi Register (BARU)
       */
      register: async (username, email, password, namaLengkap) => {
        try {
          // Panggil apiRegister dari lib/api.js
          const data = await apiRegister(username, email, password, namaLengkap);
          // Anda bisa memilih untuk login otomatis setelah register, 
          // atau hanya menampilkan pesan sukses
          return data; // Mengembalikan { message: '...' }
        } catch (error) {
          console.error("Register Gagal di Store:", error);
          throw error; // Lempar error agar bisa ditangkap UI
        }
      },

      /**
       * Fungsi Logout
       */
      logout: () => {
        set({ user: null, token: null });
        // Hapus juga data keranjang saat logout
        // (Jika Anda menggunakan persist di cartStore, panggil cartStore.clearCart())
      },
    }),
    {
      name: 'auth-storage', // Nama key di localStorage
      storage: createJSONStorage(() => localStorage), // Gunakan localStorage
    }
  )
);

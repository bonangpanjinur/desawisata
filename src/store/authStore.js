// src/store/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiFetch } from '@/lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,         // Data user (id, email, display_name, roles)
      token: null,        // Access Token JWT
      refreshToken: null,
      isLoading: false,
      error: null,

      // Aksi Login
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
          });
          set({
            user: data.user,
            token: data.token.access_token,
            refreshToken: data.token.refresh_token,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      // Aksi Register (Pembeli Biasa)
      register: async (username, email, password, display_name) => {
        set({ isLoading: true, error: null });
        try {
          await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password, display_name }),
          });
          // Setelah register, langsung login
          return await get().login(username, password);
        } catch (error) {
          set({ isLoading: false, error: error.message });
          return false;
        }
      },

      // Aksi Logout
      logout: async () => {
        set({ isLoading: true, error: null });
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            // Beri tahu backend untuk mencabut token
            await apiFetch('/auth/logout', {
              method: 'POST',
              body: JSON.stringify({ refresh_token: refreshToken }),
            });
          } catch (error) {
            // Tetap logout di frontend meskipun API gagal
            console.error("API logout error:", error.message);
          }
        }
        // Hapus data dari state
        set({
          user: null,
          token: null,
          refreshToken: null,
          isLoading: false,
          error: null,
        });
      },

      // TODO: Fungsi untuk refresh token (bisa dipanggil di _app.js)
      // refreshToken: async () => { ... }
    }),
    {
      name: 'sadesa-auth-storage', // Nama item di localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);


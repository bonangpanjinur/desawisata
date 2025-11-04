// src/store/cartStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiFetch } from '@/lib/api';

// Ini adalah store yang SINKRON dengan API
// Perubahan di sini idealnya juga memanggil API /cart/me

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // Array dari { product_id, variation_id, quantity, ...dataProduk }
      total: 0,
      isLoading: false,
      error: null,

      // Mengambil keranjang dari backend (saat login atau load)
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const data = await apiFetch('/cart/me');
          set({ items: data.items, total: data.total, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Menambah/Update item
      addItem: async (product_id, variation_id = 0, quantity = 1) => {
        set({ isLoading: true });
        try {
          const data = await apiFetch('/cart/me', {
            method: 'POST',
            body: JSON.stringify({ product_id, variation_id, quantity }),
          });
          set({ items: data.items, total: data.total, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },

      // Menghapus item
      removeItem: async (product_id, variation_id = 0) => {
        set({ isLoading: true });
        try {
          const data = await apiFetch('/cart/me', {
            method: 'DELETE',
            body: JSON.stringify({ product_id, variation_id }),
          });
          set({ items: data.items, total: data.total, isLoading: false });
        } catch (error) {
          set({ isLoading: false, error: error.message });
        }
      },
      
      // Mengosongkan keranjang (helper)
      clearCart: () => {
        // Ini hanya helper frontend, API akan clear cart saat checkout
        set({ items: [], total: 0 });
      }
    }),
    {
      name: 'sadesa-cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);


/**
 * LOKASI FILE: src/lib/api.js
 * PERUBAHAN:
 * 1. Menambahkan 'export' di depan 'apiFetch' dan 'apiUploadFile'.
 * 2. Menambahkan fungsi 'apiGetReviews' yang hilang.
 * 3. Menambahkan INTERCEPTOR RESPON ERROR (BARU) untuk mem-parsing pesan error
 * spesifik dari server sebelum error tersebut ditangkap oleh komponen.
 */
import axios from 'axios';
import { useAuthStore } from '@/store/authStore'; 
import { toast } from 'react-hot-toast'; // Impor toast untuk error global

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bonang.my.id/wp-json/dw/v1';

export const apiFetch = axios.create({ // PERBAIKAN: export
  baseURL: BASE_URL,
});

// Interceptor untuk menambahkan token Auth
apiFetch.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR RESPON ERROR (BARU) ---
// Ini adalah inti dari perbaikan Anda.
// Ini akan menangkap SEMUA error dari apiFetch
apiFetch.interceptors.response.use(
  (response) => response, // Biarkan respon sukses lolos
  (error) => {
    // Fungsi ini akan berjalan SETIAP KALI API call gagal
    let specificMessage = 'Terjadi kesalahan. Silakan coba lagi nanti.';

    if (error.response) {
      // Server merespon dengan status error (4xx, 5xx)
      const data = error.response.data;
      
      // Coba cari pesan error spesifik dari backend
      if (data && data.message) {
        specificMessage = data.message;
      } else if (data && data.error) {
        specificMessage = data.error;
      } else if (typeof data === 'string' && data.length < 150) {
        // Kadang backend hanya merespon string error
        specificMessage = data;
      } else if (error.response.statusText) {
        // Fallback ke status text
        specificMessage = `${error.response.status}: ${error.response.statusText}`;
      }
      
    } else if (error.request) {
      // Request dibuat tapi tidak ada respon (masalah jaringan)
      specificMessage = 'Gagal terhubung ke server. Periksa koneksi internet Anda.';
    } else {
      // Kesalahan lain saat setup request
      specificMessage = error.message;
    }
    
    // Lemparkan error baru HANYA DENGAN PESAN SPESIFIK.
    // Ini yang akan ditangkap oleh .catch() di halaman/store Anda.
    return Promise.reject(new Error(specificMessage));
  }
);
// --- AKHIR INTERCEPTOR BARU ---


// --- OTENTIKASI ---
export const apiLogin = async (username, password) => {
  const { data } = await apiFetch.post('/auth/login', { username, password });
  return data;
};

export const apiRegister = async (username, email, password, nama_lengkap) => {
  const { data } = await apiFetch.post('/auth/register', {
    username,
    email,
    password,
    nama_lengkap,
  });
  return data;
};

// --- DATA PUBLIK ---
export const apiGetBanners = async () => {
  const { data } = await apiFetch.get('/banner');
  return data;
};

export const apiGetKategoriProduk = async () => {
  const { data } = await apiFetch.get('/kategori/produk');
  return data;
};

export const apiGetKategoriWisata = async () => {
  const { data } = await apiFetch.get('/kategori/wisata');
  return data;
};

export const apiGetDesa = async (params) => {
  const { data } = await apiFetch.get('/desa', { params });
  return data;
};

export const apiGetDesaDetail = async (id) => {
  const { data } = await apiFetch.get(`/desa/${id}`);
  return data;
};

export const apiGetProduk = async (params) => {
  const { data } = await apiFetch.get('/produk', { params });
  return data;
};

export const apiGetProdukDetail = async (slug) => {
  const { data } = await apiFetch.get(`/produk/slug/${slug}`);
  return data;
};

export const apiGetWisata = async (params) => {
  const { data } = await apiFetch.get('/wisata', { params });
  return data;
};

export const apiGetWisataDetail = async (slug) => {
  const { data } = await apiFetch.get(`/wisata/slug/${slug}`);
  return data;
};

export const apiGetTokoDetail = async (id, params) => {
  const { data } = await apiFetch.get(`/toko/${id}`, { params });
  return data;
};

export const apiGetPublicSettings = async () => {
  const { data } = await apiFetch.get('/settings');
  return data;
};

// --- FUNGSI BARU YANG HILANG ---
export const apiGetReviews = async (target_type, target_id, params) => {
  const { data } = await apiFetch.get(`/reviews/${target_type}/${target_id}`, { params });
  return data;
};

// --- DATA PEMBELI (AUTH) ---
export const apiGetAlamat = async () => {
  const { data } = await apiFetch.get('/pembeli/addresses');
  return data;
};

export const apiGetMyOrders = async () => {
  const { data } = await apiFetch.get('/pembeli/orders');
  return data;
};

export const apiGetMyOrderDetail = async (id) => {
  const { data } = await apiFetch.get(`/pembeli/orders/${id}`);
  return data;
};

export const apiGetShippingOptions = async (payload) => {
  const { data } = await apiFetch.post('/shipping-options', payload);
  return data;
};

export const apiCreateOrder = async (payload) => {
  const { data } = await apiFetch.post('/pembeli/orders', payload);
  return data;
};

export const apiConfirmPayment = async (payload) => {
  const { data } = await apiFetch.post('/pembeli/orders/confirm-payment', payload);
  return data;
};

export const apiUploadFile = async (file) => { // PERBAIKAN: export
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await apiFetch.post('/pembeli/upload-media', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return data;
};

// --- FUNGSI SINKRONISASI KERANJANG (BARU) ---
export const apiGetMyCart = async () => {
  const { data } = await apiFetch.get('/pembeli/cart');
  return data;
};

export const apiSyncMyCart = async (items) => {
  const { data } = await apiFetch.post('/pembeli/cart/sync', { items });
  return data;
};

export const apiClearMyCart = async () => {
  const { data } = await apiFetch.delete('/pembeli/cart');
  return data;
};
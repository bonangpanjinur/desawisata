// src/lib/api.js
// PERBAIKAN: Menambahkan 3 fungsi baru untuk Cart Sync

import axios from 'axios';
import useAuthStore from '@/store/authStore';

// 1. URL API Anda sudah diperbaiki sebelumnya
const BASE_URL = 'https://admin.bonang.my.id/wp-json/dw/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Coba ekstrak pesan error dari backend
    const message = error.response?.data?.message || 'Terjadi kesalahan pada server.';
    // Kita lempar error baru dengan pesan yang lebih baik
    return Promise.reject(new Error(message));
  }
);

// --- OTENTIKASI ---
export const apiLogin = async (username, password) => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const apiRegister = async (username, email, password, nama_lengkap) => {
  const { data } = await api.post('/auth/register', { username, email, password, nama_lengkap });
  return data;
};

export const apiValidateToken = async () => {
  const { data } = await api.get('/auth/validate-token');
  return data;
};

// --- DATA PUBLIK ---
export const apiGetBanners = async () => {
  const { data } = await api.get('/banner');
  return data;
};
export const apiGetKategoriProduk = async () => {
  const { data } = await api.get('/kategori/produk');
  return data;
};
export const apiGetKategoriWisata = async () => {
  const { data } = await api.get('/kategori/wisata');
  return data;
};
export const apiGetDesa = async (page = 1, per_page = 6, search = '') => {
  const { data } = await api.get('/desa', { params: { page, per_page, search } });
  return data;
};
export const apiGetDesaById = async (id) => {
  const { data } = await api.get(`/desa/${id}`);
  return data;
};

// ... (API Produk dan Wisata tetap sama) ...
export const apiGetProducts = async (params) => {
  const { data } = await api.get('/produk', { params });
  return data;
};
export const apiGetProductBySlug = async (slug) => {
  const { data } = await api.get(`/produk/slug/${slug}`);
  return data;
};
export const apiGetWisata = async (params) => {
  const { data } = await api.get('/wisata', { params });
  return data;
};
export const apiGetWisataBySlug = async (slug) => {
  const { data } = await api.get(`/wisata/slug/${slug}`);
  return data;
};
export const apiGetReviews = async (type, id, page = 1, per_page = 5) => {
  const { data } = await api.get(`/reviews/${type}/${id}`, { params: { page, per_page } });
  return data;
};
export const apiGetTokoPage = async (id, params) => {
  const { data } = await api.get(`/toko/${id}`, { params });
  return data;
};
export const apiGetPublicSettings = async () => {
  const { data } = await api.get('/settings');
  return data;
};

// --- PEMBELI (AUTH REQUIRED) ---
export const apiGetAlamat = async () => {
  const { data } = await api.get('/pembeli/addresses');
  return data;
};

// ... (API Checkout, Order, dll tetap sama) ...
export const apiGetShippingOptions = async (data) => {
  const { data: responseData } = await api.post('/shipping-options', data);
  return responseData;
};
export const apiCreateOrder = async (orderData) => {
  const { data } = await api.post('/pembeli/orders', orderData);
  return data;
};
export const apiGetMyOrders = async () => {
  const { data } = await api.get('/pembeli/orders');
  return data;
};
export const apiGetOrderDetail = async (id) => {
  const { data } = await api.get(`/pembeli/orders/${id}`);
  return data;
};
export const apiConfirmPayment = async (order_id, payment_proof_url) => {
  const { data } = await api.post('/pembeli/orders/confirm-payment', { order_id, payment_proof_url });
  return data;
};
export const apiUploadMedia = async (formData) => {
  const { data } = await api.post('/pembeli/upload-media', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// 2. TAMBAHKAN FUNGSI API BARU UNTUK CART SYNC
/**
 * [BARU] Mengambil keranjang dari server
 */
export const apiGetMyCart = async () => {
  const { data } = await api.get('/pembeli/cart');
  return data;
};

/**
 * [BARU] Mensinkronkan (mengganti) keranjang di server dengan keranjang lokal
 * @param {Array} items - Array dari item keranjang
 */
export const apiSyncMyCart = async (items) => {
  const { data } = await api.post('/pembeli/cart/sync', { items });
  return data;
};

/**
 * [BARU] Membersihkan keranjang di server
 */
export const apiClearMyCart = async () => {
  const { data } = await api.delete('/pembeli/cart');
  return data;
};

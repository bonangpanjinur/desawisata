// File: src/lib/api.js
// VERSI LENGKAP - Termasuk fungsi Auth, Checkout, dan Pesanan
import { useAuthStore } from '@/store/authStore';

// --- PERBAIKAN KRITIS ---
// Namespace API Anda di plugin adalah 'dw/v1', bukan 'desawisata/v1'.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bonang.my.id/wp-json/dw/v1';

/**
 * Fungsi helper universal untuk fetch API (GET)
 */
export async function apiFetch(endpoint, options = {}) {
  const { token } = useAuthStore.getState(); // Ambil token dari store
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Terjadi kesalahan pada server');
    }
    
    // Handle no-content responses (misal: 204)
    const text = await response.text();
    return text ? JSON.parse(text) : {};

  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    throw error; // Lempar error agar bisa ditangkap oleh pemanggil
  }
}

/**
 * Fungsi helper baru untuk POST/PUT/PATCH
 */
export async function apiPost(endpoint, data, method = 'POST', token = null) {
  const authToken = token || useAuthStore.getState().token;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    defaultHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: method,
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(responseData?.message || `${response.statusText}`);
    }

    return responseData;
  } catch (error) {
    console.error(`API Post Error (${endpoint}):`, error);
    throw error;
  }
}


// =========================================================================
// FUNGSI AUTH
// =========================================================================

/**
 * Melakukan login pengguna
 * @param {string} username - Username atau Email
 * @param {string} password - Password
 * @returns {Promise<object>} - { token, user_data }
 */
export const apiLogin = async (username, password) => {
  return await apiPost('/auth/login', { username, password });
};

/**
 * Melakukan registrasi pengguna baru
 * @param {string} username 
 * @param {string} email 
 * @param {string} password 
 * @param {string} namaLengkap 
 * @returns {Promise<object>} - { message }
 */
export const apiRegister = async (username, email, password, namaLengkap) => {
  return await apiPost('/auth/register', { 
    username, 
    email, 
    password, 
    nama_lengkap: namaLengkap // Sesuaikan dengan key di backend
  });
};

/**
 * Mengunggah file (untuk bukti bayar nanti)
 * @param {File} file 
 * @param {string} token 
 * @returns {Promise<object>} - { url }
 */
export const apiUploadFile = async (file, token) => {
  const formData = new FormData();
  formData.append('file', file); // 'file' harus cocok dengan key di backend

  const authToken = token || useAuthStore.getState().token;
  
  try {
    const response = await fetch(`${BASE_URL}/pembeli/upload-media`, { // Endpoint ini perlu ada di api-pembeli.php
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        // 'Content-Type' jangan diset, biarkan browser menentukannya untuk FormData
      },
      body: formData,
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData?.message || 'Gagal mengunggah file.');
    }

    return responseData; // Harusnya berisi { url: '...' }
  } catch (error) {
    console.error('API Upload Error:', error);
    throw error;
  }
};


// =========================================================================
// FUNGSI CHECKOUT & PESANAN
// =========================================================================

/**
 * Mengambil alamat pengiriman milik pengguna
 */
export const apiGetMyAddresses = async () => {
  return await apiFetch('/pembeli/addresses');
};

/**
 * Menambahkan alamat pengiriman baru
 * @param {object} addressData - Data dari form alamat
 */
export const apiAddAddress = async (addressData) => {
  return await apiPost('/pembeli/addresses', addressData);
};

/**
 * Mengambil opsi pengiriman berdasarkan keranjang dan alamat
 * @param {Array} cartItems - [ { product_id: ... }, ... ]
 * @param {object} addressApi - { kecamatan_id: ..., kelurahan_id: ... }
 */
export const apiGetShippingOptions = async (cartItems, addressApi) => {
  return await apiPost('/shipping-options', {
    cart_items: cartItems,
    address_api: addressApi,
  });
};

/**
 * Membuat pesanan baru
 * @param {object} orderPayload - { cart_items, shipping_address_id, seller_shipping_choices, payment_method }
 */
export const apiCreateOrder = async (orderPayload) => {
  return await apiPost('/pembeli/orders', orderPayload);
};

/**
 * Mengambil daftar pesanan pengguna
 */
export const apiGetMyOrders = async (page = 1) => {
  return await apiFetch(`/pembeli/orders?page=${page}`);
};

/**
 * Mengambil detail pesanan
 * @param {string|number} orderId 
 */
export const apiGetOrderDetail = async (orderId) => {
  return await apiFetch(`/pembeli/orders/${orderId}`);
};

/**
 * Konfirmasi pembayaran
 * @param {string|number} orderId 
 * @param {string} paymentProofUrl 
 * @param {string} notes 
 */
export const apiConfirmPayment = async (orderId, paymentProofUrl, notes) => {
  return await apiPost('/pembeli/orders/confirm-payment', {
    order_id: orderId,
    payment_proof_url: paymentProofUrl,
    notes: notes,
  });
};

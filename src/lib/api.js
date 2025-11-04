// src/lib/api.js
import { useAuthStore } from "@/store/authStore";

// URL Backend WordPress Anda
export const API_BASE_URL = "https://admin.sadesa.site/wp-json/dw/v1";

// Helper 'fetch' kustom yang akan otomatis menyertakan Token JWT
export const apiFetch = async (endpoint, options = {}) => {
  const { token } = useAuthStore.getState();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Untuk upload file (FormData), jangan set Content-Type
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Buat error yang bisa dibaca
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    // Handle no content
    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null;
    }

    return await response.json();

  } catch (error) {
    console.error(`API Fetch Error (${endpoint}):`, error);
    throw error; // Lempar error agar bisa ditangkap oleh komponen
  }
};


import { useAuthStore } from "@/store/authStore";

// PERBAIKAN: Mengganti URL API ke domain baru Anda
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://admin.bonang.my.id/wp-json/dw/v1';

export const apiFetch = async (endpoint, options = {}) => {
  const { token } = useAuthStore.getState();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({ message: response.statusText }));
    console.error("API Fetch Error:", errorBody);
    throw new Error(errorBody.message || 'Terjadi kesalahan pada server');
  }

  // Handle no-content responses (misal: DELETE)
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};


// File: src/lib/utils.js
// Helper untuk memformat mata uang

/**
 * Mengubah angka menjadi format mata uang Rupiah (IDR).
 * @param {number | string} amount - Jumlah uang.
 * @returns {string} - String format mata uang (e.g., "Rp 10.000").
 */
export function formatCurrency(amount) {
  if (typeof amount !== 'number') {
    amount = parseFloat(amount) || 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Anda bisa menambahkan helper lain di sini nanti

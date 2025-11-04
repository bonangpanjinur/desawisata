// src/pages/api/manifest/toko/[id].js
// API Endpoint ini membuat file manifest.json dinamis

import { apiFetch } from "@/lib/api";

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing toko ID' });
  }

  try {
    // Ambil data toko dari backend WordPress Anda
    // Kita hanya butuh data publik, jadi panggil endpoint publik
    const tokoData = await apiFetch(`/toko/${id}`); 
    const toko = tokoData.toko;
    
    if (!toko) {
      return res.status(404).json({ error: 'Toko not found' });
    }

    // Buat manifest dinamis
    const manifest = {
      name: toko.nama_toko,
      short_name: toko.nama_toko.substring(0, 12),
      description: `Pesan produk dari ${toko.nama_toko} di Sadesa.site`,
      start_url: `/toko/${id}?source=pwa`, // Buka langsung ke halaman toko
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#1d4ed8", // Ganti dengan warna tema desa/toko jika ada
      icons: [
        {
          // TODO: Ganti /icon-192x192.png dengan logo toko jika ada
          "src": "/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          // TODO: Ganti /icon-512x512.png dengan logo toko jika ada
          "src": "/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ]
    };

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(manifest);

  } catch (error) {
    console.error(`Gagal membuat manifest dinamis untuk toko ${id}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


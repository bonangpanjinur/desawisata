// src/components/StorePWA.js
import { useEffect, useState } from 'react';
import { IconDownload } from './icons';

export default function StorePWAInstall({ tokoId, tokoName }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Cek apakah sudah diinstall (dalam mode standalone)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt event fired');
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  // Update link manifest dinamis
  useEffect(() => {
    const link = document.getElementById('manifest-link');
    if (link && tokoId) {
      link.href = `/api/manifest/toko/${tokoId}`;
      console.log(`Manifest link updated for toko ${tokoId}`);
    }
  }, [tokoId]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(`Untuk menginstall PWA ${tokoName}:\n1. Klik tombol 'Share' atau 'Menu' (titik tiga) di browser Anda.\n2. Pilih 'Tambahkan ke Layar Utama' (Add to Home Screen).`);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled || !tokoId) {
    return null;
  }

  return (
    <div className="my-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
      <p className="font-semibold text-primary">Dapatkan Aplikasi Toko Ini!</p>
      <p className="text-sm text-gray-700">Install aplikasi {tokoName} di HP Anda untuk pemesanan lebih cepat.</p>
      <button
        onClick={handleInstallClick}
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
      >
        <IconDownload className="h-4 w-4" />
        Install Aplikasi {tokoName}
      </button>
    </div>
  );
}


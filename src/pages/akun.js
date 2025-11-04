// src/pages/akun.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { apiFetch } from '@/lib/api';
import { IconUser, IconLogOut, IconPackage } from '@/components/icons';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

// Komponen Form Login
function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      onLoginSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username atau Email"
        required
        className="w-full rounded-lg border border-gray-300 p-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        className="w-full rounded-lg border border-gray-300 p-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-primary py-3 text-lg font-semibold text-white shadow-lg hover:bg-primary-dark disabled:bg-gray-400"
      >
        {isLoading ? 'Loading...' : 'Login'}
      </button>
      <p className="text-center text-sm">
        Belum punya akun?{' '}
        <button onClick={onSwitchToRegister} className="font-semibold text-primary hover:underline">
          Daftar di sini
        </button>
      </p>
    </form>
  );
}

// Komponen Form Register
function RegisterForm({ onRegisterSuccess, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(username, email, password, displayName);
    if (success) {
      onRegisterSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="rounded-lg bg-red-100 p-3 text-red-700">{error}</p>}
      <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Nama Lengkap" required className="w-full rounded-lg border p-3..." />
      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full rounded-lg border p-3..." />
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required className="w-full rounded-lg border p-3..." />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full rounded-lg border p-3..." />
      <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-primary py-3 font-semibold text-white...">
        {isLoading ? 'Mendaftar...' : 'Daftar'}
      </button>
      <p className="text-center text-sm">
        Sudah punya akun?{' '}
        <button onClick={onSwitchToLogin} className="font-semibold text-primary hover:underline">
          Login di sini
        </button>
      </p>
    </form>
  );
}

// Komponen Halaman Profil (Setelah Login)
function ProfilePage({ orders }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-500">
          <IconUser className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{user.display_name}</h2>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Daftar Pesanan */}
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Pesanan Saya</h3>
        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => ( // Tampilkan 5 terbaru
              <Link key={order.id} href={`/pesanan/${order.id}`}>
                <div className="flex justify-between items-center rounded-lg border p-3 hover:bg-gray-50">
                  <div>
                    <p className="font-semibold">{order.kode_unik}</p>
                    <p className="text-sm text-gray-500">{order.nama_toko}</p>
                    <p className="text-sm font-medium text-primary">{order.status_label}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">Rp {order.total_akhir.toLocaleString('id-ID')}</p>
                    <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Anda belum memiliki pesanan.</p>
        )}
      </div>

      <button
        onClick={handleLogout}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-red-500 py-3 font-semibold text-red-500 hover:bg-red-50"
      >
        <IconLogOut className="h-5 w-5" />
        Logout
      </button>
    </div>
  );
}

// Halaman Akun Utama
export default function AkunPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Jika sudah login, ambil data pesanan
      setIsLoading(true);
      apiFetch('/orders/me')
        .then(data => setOrders(data))
        .catch(err => console.error("Gagal ambil pesanan:", err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const handleLoginSuccess = () => {
    // Cek apakah ada redirect URL
    const redirect = router.query.redirect || '/';
    router.replace(redirect);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-md">
        {isLoading ? (
          <LoadingSpinner />
        ) : user ? (
          // Tampilan Jika Sudah Login
          <ProfilePage orders={orders} />
        ) : (
          // Tampilan Jika Belum Login
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h1 className="mb-6 text-center text-3xl font-bold">
              {isRegistering ? 'Daftar Akun Baru' : 'Login ke Sadesa'}
            </h1>
            {isRegistering ? (
              <RegisterForm
                onRegisterSuccess={handleLoginSuccess}
                onSwitchToLogin={() => setIsRegistering(false)}
              />
            ) : (
              <LoginForm
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setIsRegistering(true)}
              />
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}


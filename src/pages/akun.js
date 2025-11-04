// File: src/pages/akun.js
// PERBAIKAN: Implementasi penuh form Login dan Register dengan state dan handler
// PERBAIKAN 2: Mengganti nama import IconLogout -> IconLogOut
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/store/authStore';
import Layout from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { IconUser, IconLogOut, IconShoppingBag, IconChevronRight, IconEye, IconEyeOff } from '@/components/icons'; // PERBAIKAN DI SINI
import Link from 'next/link';

export default function AkunPage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();

  // State untuk form
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null); // Untuk pesan sukses register
  const [showPassword, setShowPassword] = useState(false);

  // State Form Login
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // State Form Register
  const [regNama, setRegNama] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const { login, register } = useAuthStore();

  // Handler untuk Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(loginUsername, loginPassword);
      router.push('/akun'); // Redirect ke halaman akun (yang akan menampilkan profil)
    } catch (err) {
      setError(err.message || 'Login gagal. Periksa kembali username/password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler untuk Register (BARU)
  const handleRegister = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (!regNama || !regUsername || !regEmail || !regPassword) {
      setError('Semua field wajib diisi.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const data = await register(regUsername, regEmail, regPassword, regNama);
      setMessage(data.message || 'Registrasi berhasil! Silakan masuk.');
      setActiveTab('login'); // Pindahkan ke tab login setelah sukses
      // Kosongkan form register
      setRegNama('');
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Registrasi gagal. Username/Email mungkin sudah digunakan.');
    } finally {
      setIsLoading(false);
    }
  };


  // Tampilan Jika Sudah Login
  if (token && user) {
    return (
      <Layout>
        <div className="flex items-center gap-4 border-b pb-6 mb-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200">
            <IconUser className="h-10 w-10 text-gray-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.display_name || 'Pengguna'}</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <Link href="/pesanan">
            <div className="flex cursor-pointer items-center justify-between rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center gap-3">
                <IconShoppingBag className="h-6 w-6 text-primary" />
                <span className="font-semibold">Pesanan Saya</span>
              </div>
              <IconChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
          {/* Tambahkan link lain di sini (misal: Alamat, Pengaturan Akun) */}
        </nav>

        <button
          onClick={() => {
            logout();
            router.push('/'); // Kembali ke beranda setelah logout
          }}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-red-500 py-3 px-4 font-semibold text-white shadow transition-colors hover:bg-red-600"
        >
          <IconLogOut className="h-5 w-5" />
          <span>Keluar</span>
        </button>
      </Layout>
    );
  }

  // Tampilan Jika Belum Login (Form Login/Register)
  return (
    <Layout>
      <h1 className="mb-6 text-center text-3xl font-bold">Akun Saya</h1>

      {/* Toggler Tab */}
      <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-200 p-1">
        <button
          onClick={() => { setActiveTab('login'); setError(null); setMessage(null); }}
          className={`rounded-md py-2 text-center font-semibold ${activeTab === 'login' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
        >
          Masuk
        </button>
        <button
          onClick={() => { setActiveTab('register'); setError(null); setMessage(null); }}
          className={`rounded-md py-2 text-center font-semibold ${activeTab === 'register' ? 'bg-white text-primary shadow' : 'text-gray-600'}`}
        >
          Daftar
        </button>
      </div>

      {/* Menampilkan Error atau Message */}
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-center text-sm text-green-700">
          {message}
        </div>
      )}

      {/* Form Login */}
      <form onSubmit={handleLogin} className={`flex-col gap-4 ${activeTab === 'login' ? 'flex' : 'hidden'}`}>
        <div>
          <label className="mb-1 block font-semibold" htmlFor="loginUser">Username atau Email</label>
          <input
            id="loginUser"
            type="text"
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <label className="mb-1 block font-semibold" htmlFor="loginPass">Password</label>
          <input
            id="loginPass"
            type={showPassword ? 'text' : 'password'}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[44px] -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary py-3 px-4 font-semibold text-white shadow transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5" /> : 'Masuk'}
        </button>
      </form>

      {/* Form Register (BARU) */}
      <form onSubmit={handleRegister} className={`flex-col gap-4 ${activeTab === 'register' ? 'flex' : 'hidden'}`}>
        <div>
          <label className="mb-1 block font-semibold" htmlFor="regNama">Nama Lengkap</label>
          <input
            id="regNama"
            type="text"
            value={regNama}
            onChange={(e) => setRegNama(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold" htmlFor="regUser">Username</label>
          <input
            id="regUser"
            type="text"
            value={regUsername}
            onChange={(e) => setRegUsername(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div>
          <label className="mb-1 block font-semibold" htmlFor="regEmail">Email</label>
          <input
            id="regEmail"
            type="email"
            value={regEmail}
            onChange={(e) => setRegEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          {/* INI YANG DIPERBAIKI */}
          <label className="mb-1 block font-semibold" htmlFor="regPass">Password</label>
          <input
            id="regPass"
            type={showPassword ? 'text' : 'password'}
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="relative">
          <label className="mb-1 block font-semibold" htmlFor="regConfirmPass">Konfirmasi Password</label>
          <input
            id="regConfirmPass"
            type={showPassword ? 'text' : 'password'}
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[44px] -translate-y-1/2 text-gray-500"
          >
            {showPassword ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
          </button>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-primary py-3 px-4 font-semibold text-white shadow transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {isLoading ? <LoadingSpinner className="h-5 w-5" /> : 'Daftar'}
        </button>
      </form>
    </Layout>
  );
}

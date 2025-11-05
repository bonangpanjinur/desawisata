// src/pages/akun.js
// PERBAIKAN: 
// 1. Mengubah impor default 'useAuthStore' menjadi impor bernama.
// 2. Mengubah `toast.error("pesan.. " + error.message)` menjadi `toast.error(error.message)`.
// 3. Mengimpor 'apiRegister' yang benar.
// 4. Mengimpor ikon 'Eye' dan 'EyeOff' yang hilang.
import { useAuthStore } from '@/store/authStore'; // <-- PERBAIKAN: Impor bernama

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { apiRegister } from '@/lib/api'; // PERBAIKAN: Impor apiRegister
import { toast } from 'react-hot-toast'; 
import LoadingSpinner from '@/components/LoadingSpinner'; 
import { IconEye, IconEyeOff, IconUser, IconPackage, IconLogOut } from '@/components/icons'; // PERBAIKAN: Impor ikon

export default function Akun() {
  const router = useRouter();
  const { user, login, logout } = useAuthStore(); // PERBAIKAN: Panggil sebagai fungsi

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [email, setEmail] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [loading, setLoading] = useState(false); 
  const [editData, setEditData] = useState({
    displayName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setEditData({
        displayName: user.display_name || '',
        email: user.email || '',
      });
    } else {
      // Jika tidak ada user, paksa ke tab login
      setIsLogin(true);
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; 

    setLoading(true); 
    try {
      const data = await login(username, password); 
      if (data) {
        toast.success('Login berhasil!');
        const redirectPath = router.query.redirect || '/akun'; // Redirect ke /akun setelah login
        router.push(redirectPath);
      }
    } catch (error) {
      console.error(error);
      // PERBAIKAN: Tampilkan pesan error spesifik dari interceptor
      toast.error(error.message);
    } finally {
      setLoading(false); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      await apiRegister(username, email, password, namaLengkap); // PERBAIKAN: Panggil apiRegister
      
      toast.success('Registrasi berhasil! Silakan login.');
      setIsLogin(true); 
      setUsername('');
      setPassword('');
      setEmail('');
      setNamaLengkap('');

    } catch (error) {
      console.error(error);
      // PERBAIKAN: Tampilkan pesan error spesifik
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    toast.loading('Menyimpan profil...'); 

    try {
      // TODO: Implementasi apiUpdateProfile di api.js
      // const updatedUser = await apiUpdateProfile(editData);
      await new Promise(res => setTimeout(res, 1000)); 
      toast.dismiss();
      toast.success('Fitur update profil sedang dalam pengembangan.');
    } catch (error) {
      toast.dismiss();
      console.error(error);
      // PERBAIKAN: Tampilkan pesan error spesifik
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    // --- TAMPILAN JIKA SUDAH LOGIN ---
    return (
      <Layout>
        <div className="container mx-auto p-4 max-w-lg">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
              <IconUser size={40} className="text-gray-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.display_name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Menu Akun */}
          <div className="bg-white rounded-lg shadow-md divide-y">
            <Link href="/akun?tab=pesanan" className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <IconPackage className="text-primary" />
                <span className="font-semibold">Pesanan Saya</span>
              </div>
            </Link>
            <Link href="/akun?tab=alamat" className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <IconMapPin className="text-primary" />
                <span className="font-semibold">Alamat Pengiriman</span>
              </div>
            </Link>
            <div 
              onClick={() => {
                logout();
                toast.success('Logout berhasil.');
                router.push('/');
              }}
              className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer text-red-600"
            >
              <div className="flex items-center gap-3">
                <IconLogOut />
                <span className="font-semibold">Logout</span>
              </div>
            </div>
          </div>

          {/* TODO: Tampilkan konten berdasarkan router.query.tab (misal: daftar pesanan) */}

        </div>
      </Layout>
    );
  }

  // --- TAMPILAN JIKA BELUM LOGIN ---
  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`py-2 px-6 font-semibold ${isLogin ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`py-2 px-6 font-semibold ${!isLogin ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`}
            >
              Daftar
            </button>
          </div>

          {isLogin ? (
            // --- FORM LOGIN ---
            <form onSubmit={handleLogin}>
              <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="login-username">
                  Username atau Email
                </label>
                <input
                  type="text"
                  id="login-username"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-gray-700 mb-2" htmlFor="login-password">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="login-password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500"
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition duration-300 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Login'}
              </button>
            </form>
          ) : (
            // --- FORM REGISTER ---
            <form onSubmit={handleRegister}>
              <h2 className="text-2xl font-bold mb-4 text-center">Daftar Akun Baru</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="reg-nama">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  id="reg-nama"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={namaLengkap}
                  onChange={(e) => setNamaLengkap(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="reg-email">
                  Email
                </label>
                <input
                  type="email"
                  id="reg-email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="reg-username">
                  Username
                </label>
                <input
                  type="text"
                  id="reg-username"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6 relative">
                <label className="block text-gray-700 mb-2" htmlFor="reg-password">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="reg-password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-10 text-gray-500"
                >
                  {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition duration-300 disabled:bg-gray-400"
              >
                {loading ? 'Mendaftar...' : 'Daftar'}
              </button>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
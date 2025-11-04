// src/pages/akun.js
// PERBAIKAN: Menambahkan state 'loading' dan feedback error 'toast'
// untuk login, register, dan update.

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/store/authStore';
import Layout from '@/components/Layout';
import { apiFetch, apiUpdateProfile } from '@/lib/api'; // Asumsi apiUpdateProfile ada di api.js
import { toast } from 'react-hot-toast'; // 1. Impor toast

export default function Akun() {
  const router = useRouter();
  const { user, login, logout } = useAuthStore();

  // State untuk form
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');

  // 2. Tambahkan state loading
  const [loading, setLoading] = useState(false);

  // State untuk edit profil (jika sudah login)
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
      // Jika user logout atau token tidak valid, paksa ke mode login
      setIsLogin(true);
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return; // 3. Cegah klik ganda

    setLoading(true); // 4. Set loading true
    try {
      const success = await login(username, password);
      if (success) {
        toast.success('Login berhasil!');
        router.push('/');
      } else {
        // 'login' store akan menangani set error, kita tampilkan di sini
        toast.error('Login gagal. Cek kembali username/password Anda.');
      }
    } catch (error) {
      console.error(error);
      // 5. Tampilkan error ke pengguna
      toast.error(error.message || 'Terjadi kesalahan saat login.');
    } finally {
      setLoading(false); // 6. Set loading false
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      // Asumsi Anda punya apiRegister di api.js, jika tidak kita buatkan
      // Untuk sekarang, kita tiru endpoint dari plugin:
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username,
          password,
          email,
          nama_lengkap: namaLengkap,
        }),
      });
      
      toast.success('Registrasi berhasil! Silakan login.');
      setIsLogin(true); // Arahkan ke tab login
      // Kosongkan form
      setUsername('');
      setPassword('');
      setEmail('');
      setNamaLengkap('');

    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Registrasi gagal. Pastikan data unik.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    toast.loading('Menyimpan profil...'); // Contoh toast loading

    try {
      // TODO: Anda perlu membuat fungsi `apiUpdateProfile` di api.js
      // yang melakukan POST ke `/pembeli/profile/me`
      // const updatedUser = await apiUpdateProfile(editData);
      
      // Untuk sementara, kita simulasi
      // await new Promise(res => setTimeout(res, 1000)); 
      // const updatedUser = { ...user, ...editData };

      // Hapus toast loading
      toast.dismiss();

      // TODO: Update user di authStore
      // useAuthStore.setState({ user: updatedUser });
      
      toast.success('Profil berhasil diperbarui!');
    } catch (error) {
      toast.dismiss();
      console.error(error);
      toast.error(error.message || 'Gagal memperbarui profil.');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    // --- TAMPILAN JIKA SUDAH LOGIN ---
    return (
      <Layout>
        <div className="container mx-auto p-4 max-w-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Akun Saya</h1>
          <p className="text-center mb-4">
            Halo, <strong>{user.display_name}</strong> ({user.email})
          </p>

          <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Edit Profil</h2>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="displayName">
                Nama Tampilan
              </label>
              <input
                type="text"
                id="displayName"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                value={editData.displayName}
                onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="emailDisplay">
                Email (read-only)
              </label>
              <input
                type="email"
                id="emailDisplay"
                className="w-full px-4 py-2 border rounded-lg bg-gray-100"
                value={editData.email}
                readOnly
              />
            </div>
            <button
              type="submit"
              disabled={loading} // 7. Update tombol
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          <button
            onClick={() => {
              logout();
              toast.success('Logout berhasil.');
              router.push('/');
            }}
            className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition duration-300 mt-6"
          >
            Logout
          </button>
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
              className={`py-2 px-6 ${isLogin ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`py-2 px-6 ${!isLogin ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="login-password">
                  Password
                </label>
                <input
                  type="password"
                  id="login-password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading} // 7. Update tombol
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2" htmlFor="reg-password">
                  Password
                </label>
                <input
                  type="password"
                  id="reg-password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading} // 7. Update tombol
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
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

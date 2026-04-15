'use client';
import { useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import Header from '../../components/Header';
import Link from 'next/link';

export default function LoginPage() {
  const { signInAccesso } = useAuthSession();
  const [email, setEmail] = useState('test@esempio.com');
  const [password, setPassword] = useState('latuapassword');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError('');
    try {
      await signInAccesso(email, password);
    } catch (err: any) {
      setError(err.message || 'Login fallito');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Il gradiente utilizza ora le variabili brand e surface definite nel CSS globale */
    <div className="min-h-screen bg-gradient-to-r from-brand-700 to-surface-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6">
        {/* Card con raggio di curvatura accentuato per richiamare la forma a pillola */}
        <div className="bg-white rounded-[60px] shadow-2xl p-10 w-full max-w-md border border-white/50">
          <h1 className="text-3xl font-black text-center text-brand-900 mb-8 tracking-tighter uppercase">
            Accedi
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl mb-6 text-center text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-surface-700 font-bold mb-2 ml-5 text-[10px] uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-6 py-3 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-surface-700 font-bold mb-2 ml-5 text-[10px] uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-3 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full mt-10 py-4 bg-brand-600 text-white font-black rounded-full hover:bg-brand-700 transition transform active:scale-95 shadow-lg shadow-brand-600/20 uppercase tracking-widest"
          >
            {loading ? 'Sincronizzazione...' : 'Entra'}
          </button>

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-surface-700 font-medium">Non hai un account?</p>
            <Link
              href="/register"
              className="text-brand-700 font-black hover:text-brand-900 hover:underline underline-offset-4 decoration-2"
            >
              Registrati
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
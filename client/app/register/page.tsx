'use client';
import { useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import Header from '../../components/Header';
import Link from 'next/link';

export default function RegisterPage() {
  const { register } = useAuthSession();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('USER');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !role) {
      setError('Compila tutti i campi richiesti');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(firstName, lastName, email, role, password);
    } catch (err: any) {
      setError(err.message || 'Registrazione fallita');
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Il gradiente richiama la coerenza cromatica della Home e del Login */
    <div className="min-h-screen bg-gradient-to-r from-brand-700 to-surface-50 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        {/* Card a "super-pillola" con raggio di curvatura 60px */}
        <div className="bg-white rounded-[60px] shadow-2xl p-10 w-full max-w-md border border-white/50">
          <h1 className="text-3xl font-black text-center text-brand-900 mb-8 tracking-tighter uppercase">
            Registrati
          </h1>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-2xl mb-6 text-center text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-surface-700 font-bold mb-1 ml-5 text-[10px] uppercase tracking-widest">Nome</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-6 py-2.5 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="Mario"
              />
            </div>
            <div>
              <label className="block text-surface-700 font-bold mb-1 ml-5 text-[10px] uppercase tracking-widest">Cognome</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-6 py-2.5 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="Rossi"
              />
            </div>
            <div>
              <label className="block text-surface-700 font-bold mb-1 ml-5 text-[10px] uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-6 py-2.5 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="mario.rossi@esempio.it"
              />
            </div>
            <div>
              <label className="block text-surface-700 font-bold mb-1 ml-5 text-[10px] uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-6 py-2.5 text-brand-900 bg-surface-50 border-none rounded-full focus:ring-2 focus:ring-brand-600 outline-none shadow-inner"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading || !firstName || !lastName || !email || !password}
            className="w-full mt-10 py-4 bg-brand-600 text-white font-black rounded-full hover:bg-brand-700 transition transform active:scale-95 shadow-lg shadow-brand-600/20 uppercase tracking-widest"
          >
            {loading ? 'Elaborazione...' : 'Crea Account'}
          </button>

          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-sm text-surface-700 font-medium">Hai già un account?</p>
            <Link 
              href="/login" 
              className="text-brand-700 font-black hover:text-brand-900 hover:underline underline-offset-4 decoration-2"
            >
              Accedi
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
'use client';
import { useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const { register } = useAuthSession();
  const router = useRouter();

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Registrati</h1>

        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Nome</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Mario"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Cognome</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Rossi"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          disabled={loading || !firstName || !lastName || !email || !password || !role}
          className="w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Caricamento...' : 'Registrati'}
        </button>

        <p className="text-center text-gray-500 mt-4">
          Hai già un account?{' '}
          <a href="/login" className="text-indigo-600 font-medium hover:underline">
            Accedi
          </a>
        </p>
      </div>
    </div>
  );
}
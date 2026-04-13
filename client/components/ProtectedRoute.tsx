'use client';
import { useAuthSession } from '../context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthSession();
  const router = useRouter();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  if (!token) return <p>Redirecting to login...</p>;
  return <>{children}</>;
}
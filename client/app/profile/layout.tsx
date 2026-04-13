'use client';
import { AuthProvider, useAuthSession } from '@/context/authContext';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
	return (
		<AuthGuard>
		<Header />
			<main className="pt-10">{children}</main>
		</AuthGuard>
	);
}
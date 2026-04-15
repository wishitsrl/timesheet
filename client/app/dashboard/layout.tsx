'use client';
import { AuthProvider, useAuthSession } from '@/context/authContext';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
	return (
	<AuthGuard>
		<div className="min-h-screen bg-gradient-to-r from-brand-700 to-surface-50">
			<Header />
				<main>{children}</main>
		</div>
	</AuthGuard>
	);
}
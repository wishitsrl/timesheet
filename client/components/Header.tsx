'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthSession } from '../context/authContext';

export default function Header() {	
	const { user, signOut } = useAuthSession();
	const homeLink = user ? '/dashboard' : '/';
    return (
		<header className="fixed top-0 left-0 w-full bg-blue-800 text-white shadow-md z-50">
			<div className="max-w-7xl mx-auto flex justify-between items-center p-3">
				<Link href={homeLink} className="flex items-center gap-2">
					<Image
						src="/images/Logo.png"
						alt="Logo"
						width={50}
						height={30}
					/>
					<h1 className="text-2xl font-bold">Timesheet</h1>
				</Link>
				<nav>
					{user ? (
						<>
							<Link href="/dashboard" className="px-3 hover:text-gray-200">Dashboard</Link>
							<Link href="/profile" className="px-3 hover:text-gray-200">Profilo</Link>
							<button onClick={() => signOut()} className="px-3 hover:text-gray-200">
								Logout
							</button>
						</>
					) : (
					<Link href="/login" className="px-3 hover:text-gray-200">Login</Link>
					)}	
				</nav>
			</div>
		</header>
	);
}
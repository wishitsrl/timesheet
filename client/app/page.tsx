'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
			<Header />
				<main className="flex flex-col items-center justify-center py-20 gap-6">
					<div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl text-center">
						<div className="flex justify-center mb-4">
							<Image
								src="/images/Logo.png"
								alt="Logo"
								width={60}
								height={30}
							/>
						</div>
						<h1 className="text-4xl font-bold mb-4 text-gray-800">
							Benvenuto nel Timesheet
						</h1>

					</div>
					<div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl text-center">
						<div className="flex justify-center mb-4">
							<Image
								src="/images/sfondo.jpeg"
								alt="Logo"
								width={80}
								height={50}
							/>
						</div>
						<h1 className="text-3xl font-bold mb-4 text-gray-800">
							Accedi al Timesheet personale
						</h1>
				       <Link
							href="/login"
							className="block w-full mt-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl text-center hover:bg-indigo-700 transition">
							Accedi
						</Link>
						<h1 className="text-gray-600 mt-4 mb-4">
							oppure
						</h1>
						<Link href="/register" className="px-3 text-black">Registrati</Link>
					</div>
				</main>
			<Footer />
		</div>
	);
}
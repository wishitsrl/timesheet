'use client';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
	return (
		<div className="min-h-screen bg-gradient-to-r from-blue-900 to-slate-50">
			<Header />
			<main className="flex flex-col items-center justify-center py-20 gap-6">

			<div className="bg-white rounded-[60px] shadow-2xl px-12 py-8 max-w-lg text-center border border-slate-100">
				<div className="flex justify-center mb-4">
					<Image src="/images/Logo.png" alt="Logo" width={50} height={25} />
				</div>
				<h1 className="text-3xl font-black mb-1 text-blue-950 tracking-tighter">
					Benvenuto nel Timesheet
				</h1>
				<p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Piattaforma Aziendale</p>
			</div>

				<div className="bg-white rounded-[60px] shadow-2xl px-12 py-10 max-w-lg text-center border border-slate-100">
					<div className="flex justify-center mb-6">
						<Image src="/images/sfondo.jpeg" alt="Accesso" width={80} height={50} className="rounded-2xl" />
					</div>
					<h1 className="text-2xl font-black mb-6 text-blue-950 tracking-tighter">
						Accedi al Timesheet personale
					</h1>
					
<div className="flex flex-col items-center gap-6">

					<Link
						href="/login"
						className="block w-full mt-6 py-3 bg-blue-600 text-white font-semibold rounded-xl text-center hover:bg-blue-700 transition transform active:scale-95 shadow-md"
					>
						Accedi
					</Link>

					
						<p className="text-sm text-slate-500 font-medium">
							oppure non hai un account?
						</p>
						{/* Colore standard blue-700 per garantire visibilità immediata */}
						<Link
							href="/register"
							className="text-blue-700 font-black transition-all duration-300 hover:text-blue-900 hover:underline underline-offset-4 decoration-2"
						>
							Registrati
						</Link>
					</div>
				</div>

			</main>
			<Footer />
		</div>
	);
}
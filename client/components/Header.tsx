'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="px-4 pt-6">
      <nav className="bg-gradient-to-r from-brand-900 to-indigo-800 text-white rounded-full shadow-2xl p-2 flex justify-between items-center px-8 border border-white/10">
        
        {/* Lato Sinistro: Logo e Titolo */}
{/* Lato Sinistro: Logo e Titolo diventano un Link */}
<Link 
  href="/" 
  className="flex items-center gap-4 group transition-transform hover:scale-105 active:scale-95"
>
  <div className="bg-white p-1.5 rounded-full shadow-inner ring-2 ring-white/20">
    <Image 
      src="/images/Logo.png" 
      alt="Logo" 
      width={35} 
      height={35} 
      className="rounded-full"
    />
  </div>
  <div className="flex flex-col">
    <span className="text-xl font-black tracking-tighter uppercase leading-none group-hover:text-indigo-100 transition-colors">
      Timesheet
    </span>
    <span className="text-[10px] text-indigo-200 font-bold tracking-widest uppercase group-hover:text-white transition-colors">
      Corporate Portal
    </span>
  </div>
</Link>
        
        {/* Lato Destro: Link di Navigazione */}
        <div className="flex items-center gap-8">
          <Link 
            href="/login" 
            className="group relative text-sm font-bold uppercase tracking-widest"
          >
            <span className="hover:text-brand-100 transition-colors">Login</span>
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-100 transition-all group-hover:w-full"></span>
          </Link>
        </div>

      </nav>
    </header>
  );
}
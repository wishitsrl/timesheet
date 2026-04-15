'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import InserimentoTimesheet  from '../../components/InserimentoTimesheet';
import {  getAllUsers } from '../../services/profileService';

export default function DashboardLogic() {
  const { user, isActive, isAdmin, token } = useAuthSession();
  const [dipendenti, setDipendenti] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin && token.current) {
      setLoading(true);
      getAllUsers(token.current)
        .then(res => {
          setDipendenti(res.users || []); 
        })
        .catch(err => console.error("Errore caricamento:", err))
        .finally(() => setLoading(false));
    }
  }, [isAdmin, token]);

  return (
    /* GRADIENTE COORDINATO CON IL RESTO DEL PORTALE */
    <div className="text-brand-900 font-sans">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* MESSAGGIO DI BENVENUTO A FORMA DI PILLOLA */}
        <div className="bg-white rounded-full shadow-2xl mt-5 p-8 max-w-5xl mx-auto border border-white/50"> 
          <h2 className="text-2xl font-black text-center tracking-tighter uppercase">
            Ciao {user?.fullName}, {isActive ? 'sei' : 'non sei'} abilitato alle operazioni
          </h2>
        </div>

        {isActive && (
          <div className="py-5">
            {isAdmin && !selectedUser ? (
              /* GRIGLIA DIPENDENTI CON CARD ARROTONDATE */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
                {loading ? (
                  <p className="text-white text-center col-span-full animate-pulse font-bold">Sincronizzazione anagrafiche...</p>
                ) : (
                  dipendenti.map((dip) => (
                    <div 
                      key={dip._id}
                      onClick={() => setSelectedUser(dip)}
                      className="cursor-pointer bg-white rounded-[40px] shadow-lg p-8 hover:scale-105 transition-all duration-300 border border-transparent hover:border-brand-600 group"
                    >
                      <div className="flex flex-col items-center text-center space-y-2">
                        <span className="text-surface-700 text-[10px] font-black uppercase tracking-widest group-hover:text-brand-600 transition-colors">
                          Dipendente
                        </span>
                        <h3 className="text-xl font-black text-brand-900 leading-tight whitespace-pre-line uppercase tracking-tighter">
                          {dip.fullName?.split(' ').join('\n')}
                        </h3>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-surface-50 grid grid-cols-2 gap-4 text-xs font-bold">
                        <p className="text-surface-700">FERIE: <span className="text-brand-600">--</span></p>
                        <p className="text-surface-700">PERMESSI: <span className="text-brand-600">--</span></p>
                        <p className="text-surface-700">MALATTIA: <span className="text-brand-600">--</span></p>
                        <p className="col-span-2 italic text-brand-700/50 text-[10px] mt-2 text-center">Clicca per i dettagli</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="w-full relative px-4">
                {isAdmin && (
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="mb-8 ml-2 bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-full font-black shadow-lg transition-all transform active:scale-95 uppercase tracking-widest text-xs"
                  >
                    ← Torna alla lista
                  </button>
                )}
                <InserimentoTimesheet dipendenteData={selectedUser} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
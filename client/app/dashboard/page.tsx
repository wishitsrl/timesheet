'use client';
import React from 'react';
import { useEffect, useState } from 'react';
import { useAuthSession } from '../../context/authContext';
import InserimentoTimesheet  from '../../components/InserimentoTimesheet';
import {  getAllUsers } from '../../services/profileService';

export default function DashboardLogic() {

  // Variabili per espandere o nascondere sezioni del dashboard
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { user, isActive, isAdmin, token } = useAuthSession(); // Estrai isAdmin e token
  const [dipendenti, setDipendenti] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

// Recupera la lista se l'utente è ADMIN
  useEffect(() => {
    if (isAdmin && token.current) {
      setLoading(true);
      getAllUsers(token.current)
        .then(res => {
          // Assumendo che res.users sia l'array (visto il modello PaginatedUsers)
          setDipendenti(res.users || []); 
        })
        .catch(err => console.error("Errore caricamento:", err))
        .finally(() => setLoading(false));
    }
  }, [isAdmin, token]);

  const attivo = isActive ? 'Sì' : 'No';


  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-gray-800">
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <div className="bg-white rounded-3xl shadow-xl mt-5 p-8 max-w-7xl mx-auto"> 
          <h2 className="text-2xl font-bold text-center">Ciao {user?.fullName}, {attivo} abilitato alle operazioni</h2>
        </div>

{isActive && (
  <div className="py-5">
    {/* SE ADMIN E NESSUNA SELEZIONE: Mostra la griglia di tutti i dipendenti */}
    {isAdmin && !selectedUser ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-6">
        {loading ? (
          <p className="text-white text-center col-span-full animate-pulse">Caricamento anagrafiche in corso...</p>
        ) : (
          dipendenti.map((dip) => (
            <div 
              key={dip._id}
              onClick={() => setSelectedUser(dip)}
              className="cursor-pointer bg-white rounded-2xl shadow-lg p-6 hover:scale-105 transition-all border-t-4 border-indigo-500"
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Dipendente</span>
                <h3 className="text-xl font-bold text-indigo-900 leading-tight whitespace-pre-line">
                  {dip.fullName?.split(' ').join('\n')}
                </h3>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-sm">
                <p><span className="font-semibold text-indigo-600">Ferie:</span> --</p>
                <p><span className="font-semibold text-indigo-600">Permessi:</span> --</p>
                <p><span className="font-semibold text-indigo-600">Malattia:</span> --</p>
                <p className="col-span-2 italic text-gray-400 text-xs mt-1">Clicca per i dettagli</p>
              </div>
            </div>
          ))
        )}
      </div>
    ) : (
      /* SE USER SEMPLICE O ADMIN CON DIPENDENTE SELEZIONATO: Mostra il Form direttamente */
      <div className="w-full relative px-4">
        {isAdmin && (
          <button 
            onClick={() => setSelectedUser(null)}
            className="mb-6 ml-2 bg-white/20 hover:bg-white/40 text-white px-6 py-2 rounded-xl backdrop-blur-md transition-all border border-white/30 shadow-md"
          >
            ← Torna alla lista dipendenti
          </button>
        )}
        <InserimentoTimesheet 
          // Qui passerai i dati necessari a InserimentoTimesheet
          dipendenteData={selectedUser} // Passo utente cliccato 
        />
      </div>
    )}
  </div>
)}

      </main>
    </div>
  );
}
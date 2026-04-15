'use client';
import { useState, useEffect } from 'react';
import { InserimentoProps, Timesheet } from '../interfaces/models'; 
import { useAuthSession } from '../context/authContext';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';

interface ExtendedProps extends InserimentoProps {
  dipendenteData?: any; 
}

export default function InserimentoTimesheet({ dipendenteData, onClose }: any) {
  const { user, token } = useAuthSession();
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [monthData, setMonthData] = useState<Record<string, Partial<Timesheet>>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const targetUser = dipendenteData || user;
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    const fetchTimesheets = async () => {
      if (!targetUser?.email || !token.current) return;
      setIsLoading(true);
      try {
        // Correzione URL: raggio d'azione definito in server.ts e rotta in timesheet.routes.ts
        const { data } = await apiClient.get(`/timesheet/allTimesheetList?email=${targetUser.email}`, {
          headers: { Authorization: `Bearer ${token.current}` }
        });
        
        const mappedData: Record<string, Partial<Timesheet>> = {};
        data.forEach((entry: Timesheet) => {
          mappedData[entry.data] = entry; 
        });
        setMonthData(mappedData);
      } catch (error) {
        console.error("Errore caricamento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimesheets();
  }, [currentDate, targetUser, token]);

  const handleCellChange = (day: number, field: keyof Timesheet, value: any) => {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setMonthData(prev => ({
      ...prev,
      [dateKey]: { ...(prev[dateKey] || {}), [field]: value, email: targetUser.email, data: dateKey }
    }));
  };

  const handleSaveMonth = async () => {
    if (!token.current) return toast.error("Sessione scaduta");
    setIsSaving(true);
    try {
      // Correzione URL: raggio d'azione definito in server.ts e rotta in timesheet.routes.ts
      const promises = Object.values(monthData).map(payload => 
        apiClient.post('/timesheet/postTimesheet', payload, {
          headers: { Authorization: `Bearer ${token.current}` }
        })
      ); 
      await Promise.all(promises);
      toast.success("✅ Dati sincronizzati correttamente!");
    } catch (error) {
      toast.error("❌ Errore durante il salvataggio");
    } finally {
      setIsSaving(false);
    }
  };

  // ... (dentro il componente InserimentoTimesheet, vicino alle altre funzioni)

const handleDownloadPdf = async () => {
  if (!targetUser?.email) return toast.error("Email utente mancante");

  try {
    toast.loading("Generazione PDF in corso...");
    
    // Effettuiamo la chiamata chiedendo un tipo di risposta 'blob'
    const response = await apiClient.get('/timesheet/downloadPdf', {
      params: {
        email: targetUser.email,
        month: month + 1, // i mesi in JS partono da 0
        year: year
      },
      responseType: 'blob', // Fondamentale per ricevere file
    });

    // Creiamo un URL temporaneo per il file ricevuto
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    

    // Recuperiamo il nome completo e sostituiamo eventuali spazi con underscore (_)
    const displayIdentifier = targetUser?.fullName 
      ? targetUser.fullName.replace(/\s+/g, '_') 
      : targetUser.email;

    link.setAttribute('download', `Timesheet_${displayIdentifier}_${month + 1}_${year}.pdf`);

    document.body.appendChild(link);
    link.click();
    
    // Pulizia
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast.dismiss();
    toast.success("PDF scaricato con successo!");
  } catch (error) {
    toast.dismiss();
    console.error("Errore download PDF:", error);
    toast.error("Impossibile generare il PDF");
  }
};

// ... (nel JSX del componente, vicino al tasto di salvataggio)

<div className="mt-8 flex justify-end space-x-4">
  {/* NUOVO TASTO PDF */}
  <button 
    onClick={handleDownloadPdf}
    className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-red-600 transition-all flex items-center"
  >
    <span className="mr-2">📄</span> SCARICA PDF
  </button>

  <button 
    onClick={handleSaveMonth}
    disabled={isSaving}
    className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
  >
    {isSaving ? "SALVATAGGIO IN CORSO..." : "CONFERMA E SALVA TUTTO IL MESE"}
  </button>
</div>

  return (
    <div className="mx-auto w-full bg-white rounded-3xl shadow-2xl p-6">
      <div className="flex flex-col items-center mb-6 space-y-4">
        <div className="flex justify-between items-center w-full bg-indigo-50 p-4 rounded-2xl">
          <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 font-bold">←</button>
          <h2 className="text-xl font-bold text-indigo-900 uppercase">
            {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 font-bold">→</button>
        </div>
        
        <div className="bg-indigo-900 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md">
          Gestione: <span className="text-pink-300">{targetUser?.fullName || targetUser?.email}</span>
        </div>
      </div>

      <div className="hidden md:flex bg-gray-100 p-3 rounded-t-xl font-bold text-[10px] uppercase text-gray-500 mb-2 border-b">
        <div className="w-24 text-center">Giorno</div>
        <div className="flex-1 flex justify-around px-4">
          <span>Pres</span><span>Fer</span><span>Mal</span><span>104</span>
        </div>
        <div className="w-24 text-center">ROL</div>
        <div className="w-24 text-center">STR</div>
        <div className="w-64 text-center">Note</div>
      </div>

      <div className="max-h-[500px] overflow-y-auto space-y-1 pr-2">
        {isLoading ? (
          <div className="text-center py-10 text-gray-400 animate-pulse font-bold">Caricamento storico...</div>
        ) : (
          Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = monthData[dateKey] || {};
            const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isWeekend = new Date(year, month, day).getDay() === 0 || new Date(year, month, day).getDay() === 6;

            return (
              <div 
                key={day} 
                className={`flex flex-col md:flex-row items-center p-2 border-b rounded-lg transition-all ${
                  isToday ? 'border-2 border-indigo-500 bg-indigo-50 shadow-sm' : 
                  isWeekend ? 'bg-red-50/40' : 'bg-white'
                }`}
              >
                <div className="w-full md:w-24 font-bold flex justify-between md:justify-center px-4">
                  <span className={isToday ? 'text-indigo-600' : 'text-gray-700'}>{day}</span>
                  {isToday && <span className="text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full md:hidden">OGGI</span>}
                </div>

                <div className="flex-1 flex justify-around w-full py-2">
                  {['presenza', 'ferie', 'malattia', 'giorni104'].map((f) => (
                    <input 
                      key={f}
                      type="checkbox"
                      checked={!!dayData[f as keyof Timesheet]}
                      onChange={(e) => handleCellChange(day, f as keyof Timesheet, e.target.checked)}
                      className="w-4 h-4 accent-indigo-600 cursor-pointer"
                    />
                  ))}
                </div>

                <div className="w-full md:w-24 px-1">
                  <input 
                    placeholder="0.0"
                    value={dayData.permessiRol || ''}
                    onChange={(e) => handleCellChange(day, 'permessiRol', e.target.value)}
                    className="w-full text-center text-xs border-b outline-none bg-transparent"
                  />
                </div>
                <div className="w-full md:w-24 px-1">
                  <input 
                    placeholder="0.0"
                    value={dayData.straordinari || ''}
                    onChange={(e) => handleCellChange(day, 'straordinari', e.target.value)}
                    className="w-full text-center text-xs border-b outline-none bg-transparent"
                  />
                </div>
                <div className="w-full md:w-64 px-1">
                  <input 
                    placeholder="Note..."
                    value={dayData.note || ''}
                    onChange={(e) => handleCellChange(day, 'note', e.target.value)}
                    className="w-full text-xs italic bg-transparent outline-none"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button 
          onClick={handleDownloadPdf}
          className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-red-700 transition-all flex items-center">
          <span className="mr-2">📄</span> SCARICA PDF
        </button>
        <button 
          onClick={handleSaveMonth}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {isSaving ? "SALVATAGGIO IN CORSO..." : "CONFERMA E SALVA TUTTO IL MESE"}
        </button>
      </div>
    </div>
  );
}
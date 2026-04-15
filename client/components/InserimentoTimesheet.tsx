'use client';
import { useState, useEffect } from 'react';
import { Timesheet } from '../interfaces/models'; 
import { useAuthSession } from '../context/authContext';
import toast from 'react-hot-toast';
import { apiClient } from '../services/apiClient';

/**
 * Helper per identificare le festività nazionali italiane.
 */
const getFestivita = (day: number, month: number, year: number) => {
  const festivitaFisse: Record<string, string> = {
    '01-01': 'Capodanno',
    '01-06': 'Epifania',
    '04-25': 'Liberazione',
    '05-01': 'Festa del Lavoro',
    '06-02': 'Festa della Repubblica',
    '08-15': 'Ferragosto',
    '11-01': 'Ognissanti',
    '12-08': 'Immacolata',
    '12-25': 'Natale',
    '12-26': 'S. Stefano',
  };
  const d = String(day).padStart(2, '0');
  const m = String(month + 1).padStart(2, '0');
  const key = `${m}-${d}`;
  
  // Pasquetta 2026: 6 Aprile
  if (year === 2026 && month === 3 && day === 6) return "Lunedì dell'Angelo";
  
  return festivitaFisse[key] || null;
};

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

  const handleDownloadPdf = async () => {
    if (!targetUser?.email) return toast.error("Email utente mancante");

    try {
      toast.loading("Generazione PDF in corso...");
      const response = await apiClient.get('/timesheet/downloadPdf', {
        params: { email: targetUser.email, month: month + 1, year: year },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const displayIdentifier = targetUser?.fullName || targetUser.email;
      link.setAttribute('download', `Timesheet_${displayIdentifier.replace(/\s+/g, '_')}_${month + 1}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success("PDF scaricato con successo!");
    } catch (error) {
      toast.dismiss();
      toast.error("Impossibile generare il PDF");
    }
  };

  return (
    <div className="mx-auto w-full space-y-6 p-4 md:p-0">
      
      {/* HEADER A PILLOLA */}
      <div className="bg-brand-900 text-white rounded-full p-4 md:p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-4 ml-2">
          <div className="bg-white/10 p-3 rounded-2xl">
            <span className="text-2xl">📅</span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black leading-none">Timesheet</h1>
            <p className="text-brand-100/60 text-[10px] uppercase tracking-widest font-bold">Gestione Presenze</p>
          </div>
        </div>

        <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))} 
            className="px-4 py-2 hover:bg-white/10 rounded-full transition-colors font-bold text-white text-xl"
          >
            ‹
          </button>
          <span className="px-4 md:px-8 font-black uppercase text-sm md:text-base min-w-[150px] text-center">
            {currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
          </span>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))} 
            className="px-4 py-2 hover:bg-white/10 rounded-full transition-colors font-bold text-white text-xl"
          >
            ›
          </button>
        </div>

        <div className="flex items-center bg-white/10 px-5 py-2 rounded-full border border-white/5 font-bold text-sm mr-2">
           <span className="mr-2 opacity-50">👤</span> {targetUser?.fullName || targetUser?.email}
        </div>
      </div>

      {/* CONTENITORE TABELLA */}
      <div className="bg-white rounded-[40px] shadow-2xl p-4 md:p-8 border border-surface-200">
        <div className="bg-surface-50 rounded-3xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="hidden md:flex bg-surface-100 border-b border-surface-200 sticky top-0 z-10 p-4 font-black text-[11px] uppercase tracking-widest text-surface-700">
            <div className="w-24">Giorno</div>
            <div className="flex-1 flex justify-around px-4">
              <span>Pres</span><span>Fer</span><span>Mal</span><span>104</span>
            </div>
            <div className="w-24 text-center">ROL</div>
            <div className="w-24 text-center">STR</div>
            <div className="w-64 text-center">Note</div>
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-surface-100 scrollbar-thin scrollbar-thumb-surface-200">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-surface-200 animate-pulse">
                <span className="text-4xl mb-4">🌀</span>
                <p className="font-bold uppercase tracking-widest">Sincronizzazione dati...</p>
              </div>
            ) : (
              Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dayData = monthData[dateKey] || {};
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                
                // LOGICA CALENDARIO AGGIORNATA
                const dateObj = new Date(year, month, day);
                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                const nomeFesta = getFestivita(day, month, year);
                const isHoliday = !!nomeFesta;
                const nomeGiorno = dateObj.toLocaleDateString('it-IT', { weekday: 'short' }).replace('.', '');

                return (
                  <div 
                    key={day} 
                    className={`flex flex-col md:flex-row items-center p-3 transition-colors ${
                      isToday ? 'bg-brand-50 ring-1 ring-inset ring-brand-100' : 
                      (isWeekend || isHoliday) ? 'bg-red-50/60 opacity-90' : 'hover:bg-brand-50/20'
                    }`}
                  >
                    {/* GIORNO E NOME FESTA */}
                    <div className="w-full md:w-24 font-black flex flex-col justify-between md:justify-center px-4 items-center">
                      <span className={`text-base ${isToday ? 'text-brand-600' : (isWeekend || isHoliday) ? 'text-red-600' : 'text-brand-900'}`}>
                        {day} <span className="text-[10px] font-bold uppercase opacity-60 ml-1">{nomeGiorno}.</span>
                      </span>
                      {nomeFesta && (
                        <span className="text-[9px] text-red-500 font-black uppercase tracking-tighter leading-none text-center">
                          {nomeFesta}
                        </span>
                      )}
                      {isToday && <span className="text-[10px] bg-brand-600 text-white px-3 py-1 rounded-full md:hidden mt-1">OGGI</span>}
                    </div>

                    {/* CHECKBOXES */}
                    <div className="flex-1 flex justify-around w-full py-3 md:py-0">
                      {['presenza', 'ferie', 'malattia', 'giorni104'].map((f) => (
                        <input 
                          key={f}
                          type="checkbox"
                          checked={!!dayData[f as keyof Timesheet]}
                          onChange={(e) => handleCellChange(day, f as keyof Timesheet, e.target.checked)}
                          className="w-5 h-5 accent-brand-600 cursor-pointer rounded-lg"
                        />
                      ))}
                    </div>

                    {/* CAMPI INPUT ROL / STR / NOTE */}
                    <div className="w-full md:w-24 px-2 mb-2 md:mb-0">
                      <input 
                        placeholder="0.0"
                        value={dayData.permessiRol || ''}
                        onChange={(e) => handleCellChange(day, 'permessiRol', e.target.value)}
                        className="w-full text-center text-sm font-bold p-2 bg-white rounded-lg border border-surface-100 focus:border-brand-600 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="w-full md:w-24 px-2 mb-2 md:mb-0">
                      <input 
                        placeholder="0.0"
                        value={dayData.straordinari || ''}
                        onChange={(e) => handleCellChange(day, 'straordinari', e.target.value)}
                        className="w-full text-center text-sm font-bold p-2 bg-white rounded-lg border border-surface-100 focus:border-brand-600 outline-none transition-all shadow-sm"
                      />
                    </div>
                    <div className="w-full md:w-64 px-2">
                      <input 
                        placeholder="Annotazioni..."
                        value={dayData.note || ''}
                        onChange={(e) => handleCellChange(day, 'note', e.target.value)}
                        className="w-full text-sm italic p-2 bg-white/50 rounded-lg focus:bg-white border border-transparent focus:border-surface-200 outline-none transition-all"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AREA AZIONI */}
        <div className="mt-10 flex flex-col md:flex-row justify-end items-center gap-4">
          <button 
            onClick={handleDownloadPdf}
            className="w-full md:w-auto bg-white text-red-600 border-2 border-red-500 px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-red-50 transition-all flex items-center justify-center transform active:scale-95"
          >
            <span className="mr-3 text-xl">📄</span> ESPORTA PDF
          </button>
          <button 
            onClick={handleSaveMonth}
            disabled={isSaving}
            className="w-full md:w-auto bg-brand-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center transform active:scale-95"
          >
            {isSaving ? (
               <span className="flex items-center">🌀 SINCRONIZZAZIONE...</span>
            ) : (
              "SALVA TIMESHEET"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
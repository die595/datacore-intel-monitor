"use client";
import { useState, useMemo, useEffect } from 'react';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import Analytics from './components/dashboard/Analytics';
import dynamic from 'next/dynamic';
import { Filter, MapPin, BookOpen, Calendar, List, Lock, Trash2 } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-blue-500 font-mono text-[10px]">CARGANDO...</div>
});

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [eventos, setEventos] = useState<EventoSeguridad[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState('');

  // 1. Efecto de Montaje: Solo se ejecuta una vez en el navegador
  useEffect(() => {
    setHasMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  // 2. Guardado automático
  useEffect(() => {
    if (hasMounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, hasMounted]);

  const checkPassword = () => {
    if (password === "Delta2026") setIsAuthenticated(true);
    else alert("ACCESO DENEGADO");
  };

  const minTime = new Date('2016-12-01').getTime();
  const maxTime = new Date('2026-03-07').getTime();
  const [rangoTemporal, setRangoTemporal] = useState<[number, number]>([minTime, maxTime]);

  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      const matchMuni = !municipio || e.municipio === municipio;
      const matchDelito = !delito || e.delito === delito;
      const fechaE = new Date(e.fecha).getTime();
      return matchMuni && matchDelito && (isNaN(fechaE) || (fechaE >= rangoTemporal[0] && fechaE <= rangoTemporal[1]));
    });
  }, [eventos, municipio, delito, rangoTemporal]);

  // --- PREVENCION DE ERROR DE PANTALLA NEGRA ---
  if (!hasMounted) return <div className="h-screen bg-[#020617]" />;

  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020617] flex items-center justify-center p-4">
        <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 w-full max-w-md border-t-4 border-t-blue-600 shadow-2xl">
          <div className="flex justify-center mb-6 text-blue-500"><Lock size={40} /></div>
          <h2 className="text-white font-black text-center mb-6 tracking-widest uppercase">Datacore Intel</h2>
          <input 
            type="password" 
            className="w-full bg-[#020617] border border-slate-700 p-3 rounded mb-4 text-white text-center outline-none focus:border-blue-500"
            placeholder="CREDENCIAL"
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
          />
          <button onClick={checkPassword} className="w-full bg-blue-600 py-3 rounded font-black text-white uppercase text-xs">Entrar</button>
        </div>
      </div>
    );
  }

  // Si llegamos aquí, el usuario está autenticado y el componente montado
  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col">
      <header className="flex justify-between items-center h-[5vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black text-white uppercase italic">Datacore Intel</h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => { localStorage.removeItem('datacore_data'); setEventos([]); }} className="text-[9px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 uppercase font-bold">Limpiar</button>
          <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 uppercase">{eventosFiltrados.length} Regs</div>
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center"><FileUploader onDataLoaded={setEventos} /></div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl">
               <select onChange={e => setMunicipio(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-2 rounded text-[10px] outline-none">
                  <option value="">MUNICIPIOS</option>
                  {[...new Set(eventos.map(e => e.municipio))].sort().map(m => <option key={m} value={m}>{m}</option>)}
               </select>
            </div>
            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0">
              <div className="bg-slate-900/80 p-2 border-b border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-400">Log Operativo</div>
              <div className="flex-1 overflow-auto p-2">
                {eventosFiltrados.slice(0, 50).map((e, i) => (
                  <div key={i} className="mb-2 border-b border-slate-800 pb-1">
                    <p className="text-blue-400 text-[8px] font-mono">{e.fecha}</p>
                    <p className="text-[9px] font-bold uppercase">{e.delito}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden relative"><SecurityMap datos={eventosFiltrados} /></div>
            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-3 overflow-hidden"><Analytics datos={eventosFiltrados} /></div>
          </div>
        </div>
      )}
    </main>
  );
}
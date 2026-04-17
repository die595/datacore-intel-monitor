"use client";
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileUploader from './components/upload/FileUploader'; 
import { Filter, MapPin, BookOpen, Calendar, List, Trash2 } from 'lucide-react';

// --- COMPONENTES DINÁMICOS (PROTECCIÓN NETLIFY) ---
const Slider = dynamic(() => import('rc-slider'), { ssr: false });
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { ssr: false });
const Analytics = dynamic(() => import('./components/dashboard/Analytics'), { ssr: false });

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState('');

  // Rango oficial de datos
  const minTime = new Date('2016-12-01').getTime();
  const maxTime = new Date('2026-03-07').getTime();
  const [rangoTemporal, setRangoTemporal] = useState<[number, number]>([minTime, maxTime]);

  // Montaje y recuperación de caché
  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) { console.error("Error cargando caché:", e); }
    }
  }, []);

  // Guardado automático en caché
  useEffect(() => {
    if (mounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, mounted]);

  const toISODate = (time: number) => new Date(time).toISOString().split('T')[0];

  const eventosFiltrados = useMemo(() => {
    if (!eventos) return [];
    return eventos.filter(e => {
      const matchMuni = !municipio || e.municipio === municipio;
      const matchDelito = !delito || e.delito === delito;
      const fechaE = new Date(e.fecha).getTime();
      return matchMuni && matchDelito && (isNaN(fechaE) || (fechaE >= rangoTemporal[0] && fechaE <= rangoTemporal[1]));
    });
  }, [eventos, municipio, delito, rangoTemporal]);

  if (!mounted) {
    return <div className="h-screen bg-[#020617] flex items-center justify-center font-mono text-blue-500">INICIALIZANDO DATACORE...</div>;
  }

  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      {/* HEADER */}
      <header className="flex justify-between items-center h-[6vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">Datacore Intel</h1>
        </div>
        <div className="flex items-center gap-4">
          {eventos.length > 0 && (
            <button 
              onClick={() => { if(confirm("¿Eliminar registros locales?")) { localStorage.removeItem('datacore_data'); setEventos([]); } }} 
              className="text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 font-bold uppercase hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={12} className="inline mr-1"/> Limpiar Sistema
            </button>
          )}
          <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 uppercase font-mono">
            {eventosFiltrados.length} Registros Activos
          </div>
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020617]">
          <div className="bg-[#0f172a] p-10 rounded-3xl border border-slate-800 shadow-2xl">
            <h2 className="text-blue-500 font-black text-center mb-6 uppercase tracking-widest">Despliegue de Base de Datos</h2>
            <FileUploader onDataLoaded={setEventos} />
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          
          {/* PANEL LATERAL IZQUIERDO */}
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            
            {/* FILTROS GEOGRÁFICOS */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl">
               <h3 className="text-[10px] font-black text-blue-400 uppercase mb-3 flex items-center gap-2 italic"><Filter size={12}/> Filtros de Inteligencia</h3>
               <select 
                 className="w-full bg-[#020617] border border-slate-700 p-2 rounded text-xs text-white outline-none mb-2 focus:border-blue-500"
                 onChange={e => setMunicipio(e.target.value)}
                 value={municipio}
               >
                  <option value="">TODOS LOS MUNICIPIOS</option>
                  {[...new Set(eventos.map(e => e.municipio))].sort().map(m => <option key={m} value={m}>{m}</option>)}
               </select>
               <select 
                 className="w-full bg-[#020617] border border-slate-700 p-2 rounded text-xs text-white outline-none focus:border-blue-500"
                 onChange={e => setDelito(e.target.value)}
                 value={delito}
               >
                  <option value="">TODAS LAS TIPOLOGÍAS</option>
                  {[...new Set(eventos.map(e => e.delito))].sort().map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>

            {/* CONTROL TEMPORAL (EL CORREGIDO) */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-lg">
              <h3 className="text-[10px] font-black text-blue-400 uppercase mb-4 flex items-center gap-2 italic">
                <Calendar size={12}/> Rango Temporal
              </h3>
              
              <div className="px-3 py-4">
                <Slider 
                  range 
                  min={minTime} 
                  max={maxTime} 
                  value={rangoTemporal} 
                  onChange={(v: any) => setRangoTemporal(v)}
                  trackStyle={[{ backgroundColor: '#3b82f6', height: 4 }]}
                  handleStyle={[
                    { backgroundColor: '#3b82f6', border: '2px solid #3b82f6', opacity: 1, boxShadow: '0 0 5px #3b82f6' },
                    { backgroundColor: '#3b82f6', border: '2px solid #3b82f6', opacity: 1, boxShadow: '0 0 5px #3b82f6' }
                  ]}
                  railStyle={{ backgroundColor: '#1e293b', height: 4 }}
                />
              </div>

              <div className="flex justify-between mt-3 text-[9px] font-mono font-bold text-slate-400 bg-[#020617] p-2 rounded border border-slate-800/50">
                <span className="text-blue-500">{toISODate(rangoTemporal[0])}</span>
                <span className="text-blue-500">{toISODate(rangoTemporal[1])}</span>
              </div>
            </div>

            {/* LOG OPERATIVO */}
            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-0 shadow-xl">
              <div className="bg-slate-900/80 p-3 border-b border-slate-800 font-black text-[9px] uppercase text-slate-400 flex items-center gap-2">
                <List size={12} className="text-blue-500"/> Registro de Eventos
              </div>
              <div className="flex-1 overflow-auto p-2 font-mono text-[9px] custom-scrollbar">
                {eventosFiltrados.slice(0, 50).map((e, i) => (
                  <div key={i} className="mb-2 border-b border-slate-800/30 pb-1 hover:bg-white/5 transition-colors p-1 rounded">
                    <span className="text-blue-500 font-bold block">{e.fecha}</span>
                    <span className="text-white uppercase">{e.delito}</span>
                    <span className="text-slate-500 block text-[8px]">{e.municipio}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* PANEL DE VISUALIZACIÓN DERECHO */}
          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            {/* MAPA ESTRATÉGICO */}
            <div className="row-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
              <SecurityMap datos={eventosFiltrados} />
            </div>
            
            {/* ANALÍTICA DE DATOS */}
            <div className="row-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
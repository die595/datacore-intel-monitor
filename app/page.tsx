"use client";
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
// Corregido: UploadCloud sin espacio
import { Filter, BookOpen, List, Trash2, UploadCloud } from 'lucide-react';

// --- DEFINICIÓN DE INTERFAZ ---
export interface EventoSeguridad {
  fecha: string;
  delito: string;
  municipio: string;
  latitud?: number;
  longitud?: number;
}

// --- COMPONENTES DINÁMICOS CON TIPADO FLEXIBLE ---
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-blue-500 font-mono text-xs">CARGANDO MAPA...</div>
}) as any;

const Analytics = dynamic(() => import('./components/dashboard/Analytics'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-500 font-mono text-xs">CARGANDO ESTADÍSTICAS...</div>
}) as any;

import FileUploader from './components/upload/FileUploader';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]); // Usamos any[] para eliminar los rojos de las fotos
  const [municipio, setMunicipio] = useState('');

  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (mounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, mounted]);

  const eventosFiltrados = useMemo(() => {
    // Aquí ya no debería salir rojo bajo e.municipio
    return municipio ? eventos.filter((e: any) => e.municipio === municipio) : eventos;
  }, [eventos, municipio]);

  if (!mounted) return <div className="h-screen bg-[#020617]" />;

  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      <header className="flex justify-between items-center h-[6vh] border-b border-slate-800 mb-2 px-4">
        <div className="flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" />
          <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">DATACORE INTEL</h1>
        </div>
        <div className="flex items-center gap-4">
          {eventos.length > 0 && (
            <button 
              onClick={() => { if(confirm("¿Limpiar sistema?")) { localStorage.removeItem('datacore_data'); setEventos([]); } }} 
              className="text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 font-bold uppercase"
            >
              <Trash2 size={12} className="inline mr-1"/> Borrar
            </button>
          )}
          <div className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20">
            {eventosFiltrados.length} REGISTROS
          </div>
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-10">
           <FileUploader onDataLoaded={setEventos} />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl">
              <label className="text-[10px] font-black text-blue-400 uppercase mb-2 block tracking-widest">Filtro Municipio</label>
              <select 
                onChange={e => setMunicipio(e.target.value)} 
                className="w-full bg-[#020617] border border-slate-700 p-2 rounded text-xs text-white outline-none"
              >
                <option value="">TODOS</option>
                {[...new Set(eventos.map((e: any) => e.municipio))].sort().map((m: any) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col min-h-0">
              <div className="bg-slate-900/80 p-3 border-b border-slate-800 text-[10px] font-black uppercase text-slate-400">
                <List size={12} className="inline mr-2 text-blue-500" /> Log Operativo
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-2">
                {eventosFiltrados.slice(0, 50).map((e: any, i: number) => (
                  <div key={i} className="p-2 bg-[#020617]/50 rounded border border-slate-800/50">
                    <p className="text-blue-500 text-[9px] font-mono">{e.fecha}</p>
                    <p className="text-[10px] font-bold uppercase text-white">{e.delito}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            <div className="row-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden">
              <SecurityMap datos={eventosFiltrados} />
            </div>
            <div className="row-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-2xl">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
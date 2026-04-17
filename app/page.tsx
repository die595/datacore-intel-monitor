"use client";
import { useState, useMemo, useEffect } from 'react';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import Analytics from './components/dashboard/Analytics';
import dynamic from 'next/dynamic';
import { Filter, BookOpen, List, Trash2 } from 'lucide-react';

// Importación dinámica para evitar errores de servidor (SSR)
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-blue-500 font-mono text-[10px]">CARGANDO SISTEMA GEOGRÁFICO...</div>
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [eventos, setEventos] = useState<EventoSeguridad[]>([]);
  const [municipio, setMunicipio] = useState('');

  // 1. Cargar datos al iniciar (Solo en el cliente)
  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) {
        console.error("Error al cargar caché", e);
      }
    }
  }, []);

  // 2. Guardar datos automáticamente
  useEffect(() => {
    if (mounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, mounted]);

  const limpiarDatos = () => {
    if(confirm("¿Desea eliminar la base de datos actual?")) {
      localStorage.removeItem('datacore_data');
      setEventos([]);
    }
  };

  const eventosFiltrados = useMemo(() => {
    return municipio ? eventos.filter(e => e.municipio === municipio) : eventos;
  }, [eventos, municipio]);

  // Si no se ha montado el componente, devolvemos un fondo negro limpio
  if (!mounted) return <div className="h-screen bg-[#020617]" />;

  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      <header className="flex justify-between items-center h-[5vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">Datacore Intel</h1>
        </div>
        <div className="flex items-center gap-4">
          {eventos.length > 0 && (
            <button onClick={limpiarDatos} className="text-[9px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 font-bold uppercase hover:bg-red-500/20">
              <Trash2 size={12} className="inline mr-1"/> Limpiar Sistema
            </button>
          )}
          <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 uppercase">
            {eventosFiltrados.length} Registros Activos
          </div>
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <FileUploader onDataLoaded={setEventos} />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl shadow-lg">
              <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Filter size={12}/> Filtro por Municipio</h3>
              <select 
                onChange={e => setMunicipio(e.target.value)} 
                className="w-full bg-[#020617] border border-slate-700 p-2 rounded text-[10px] text-slate-300 outline-none focus:border-blue-500"
              >
                <option value="">TODOS LOS MUNICIPIOS</option>
                {[...new Set(eventos.map(e => e.municipio))].sort().map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0 shadow-xl">
              <div className="bg-slate-900/80 p-2 border-b border-slate-800 text-[9px] font-black uppercase text-slate-400 font-mono flex items-center gap-2">
                <List size={12} className="text-blue-500" /> Log Operativo
              </div>
              <div className="flex-1 overflow-auto p-2 custom-scrollbar">
                {eventosFiltrados.slice(0, 50).map((e, i) => (
                  <div key={i} className="mb-2 border-b border-slate-800/50 pb-1">
                    <p className="text-blue-400 text-[8px] font-mono">{e.fecha}</p>
                    <p className="text-[9px] font-bold uppercase leading-tight text-slate-200">{e.delito}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            <div className="row-span-7 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden relative">
              <SecurityMap datos={eventosFiltrados} />
            </div>
            <div className="row-span-5 bg-[#0f172a] border border-slate-800 rounded-xl p-3 overflow-hidden shadow-xl">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
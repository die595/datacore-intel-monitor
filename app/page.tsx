"use client";
import { useState, useMemo, useEffect } from 'react';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import Analytics from './components/dashboard/Analytics';
import dynamic from 'next/dynamic';
import { Filter, MapPin, BookOpen, Calendar, List, Trash2 } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Mapa con carga dinámica para evitar errores de servidor
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 flex items-center justify-center text-blue-500 font-mono text-[10px]">INICIALIZANDO MAPA...</div>
});

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [eventos, setEventos] = useState<EventoSeguridad[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState('');

  // 1. Cargar datos del navegador apenas abra la página
  useEffect(() => {
    setHasMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) {
        console.error("Error recuperando memoria:", e);
      }
    }
  }, []);

  // 2. Guardar datos automáticamente al importar el CSV
  useEffect(() => {
    if (hasMounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, hasMounted]);

  const limpiarDatos = () => {
    if(confirm("¿Desea borrar los datos actuales para cargar un nuevo CSV?")) {
      localStorage.removeItem('datacore_data');
      setEventos([]);
    }
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

  // Si no ha cargado en el navegador, no mostramos nada (evita la pantalla negra)
  if (!hasMounted) return <div className="h-screen bg-[#020617]" />;

  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      <header className="flex justify-between items-center h-[5vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black text-white uppercase italic tracking-tighter">Datacore Intel</h1>
        </div>
        <div className="flex items-center gap-4">
          {eventos.length > 0 && (
            <button 
              onClick={limpiarDatos} 
              className="text-[9px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 uppercase font-bold hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={12} className="inline mr-1"/> Limpiar Base
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
              <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Filter size={12}/> Filtros</h3>
              <div className="space-y-2">
                <select onChange={e => setMunicipio(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-1.5 rounded text-[10px] text-slate-300 outline-none">
                  <option value="">TODOS LOS MUNICIPIOS</option>
                  {[...new Set(eventos.map(e => e.municipio))].sort().map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select onChange={e => setDelito(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-1.5 rounded text-[10px] text-slate-300 outline-none">
                  <option value="">TODAS LAS TIPOLOGÍAS</option>
                  {[...new Set(eventos.map(e => e.delito))].sort().map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col min-h-0 shadow-xl">
              <div className="bg-slate-900/80 p-2 border-b border-slate-800 text-[9px] font-black uppercase text-slate-400 font-mono">Log Operativo</div>
              <div className="flex-1 overflow-auto p-2 custom-scrollbar">
                {eventosFiltrados.slice(0, 100).map((e, i) => (
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
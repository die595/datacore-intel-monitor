"use client";
import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import { Filter, MapPin, BookOpen, Calendar, List, Trash2 } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// --- IMPORTACIONES DINÁMICAS (LA CLAVE DEL ÉXITO EN NETLIFY) ---
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-blue-500 font-mono text-xs">INICIALIZANDO MAPA...</div>
}) as any;

const Analytics = dynamic(() => import('./components/dashboard/Analytics'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-slate-500 font-mono text-xs">CARGANDO ESTADÍSTICAS...</div>
}) as any;

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [eventos, setEventos] = useState<any[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState(''); // Faltaba el estado de delito

  // Límites temporales oficiales
  const minTime = new Date('2016-12-01').getTime();
  const maxTime = new Date('2026-03-07').getTime();
  const [rangoTemporal, setRangoTemporal] = useState<[number, number]>([minTime, maxTime]);

  // 1. MONTAGE SEGURO Y CARGA DE CACHÉ
  useEffect(() => {
    setMounted(true);
    const cached = localStorage.getItem('datacore_data');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) setEventos(parsed);
      } catch (e) { console.error("Error de caché:", e); }
    }
  }, []);

  // 2. PERSISTENCIA AUTOMÁTICA
  useEffect(() => {
    if (mounted && eventos.length > 0) {
      localStorage.setItem('datacore_data', JSON.stringify(eventos));
    }
  }, [eventos, mounted]);

  const toISODate = (time: number) => new Date(time).toISOString().split('T')[0];

  // 3. FILTRADO TÁCTICO MEJORADO
  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      const matchMuni = !municipio || e.municipio === municipio;
      const matchDelito = !delito || e.delito === delito;
      
      const fechaE = new Date(e.fecha).getTime();
      const matchDate = isNaN(fechaE) ? true : (fechaE >= rangoTemporal[0] && fechaE <= rangoTemporal[1]);
      
      return matchMuni && matchDelito && matchDate;
    });
  }, [eventos, municipio, delito, rangoTemporal]);

  const municipiosUnicos = useMemo(() => [...new Set(eventos.map(e => e.municipio))].sort(), [eventos]);
  const delitosUnicos = useMemo(() => [...new Set(eventos.map(e => e.delito))].sort(), [eventos]);

  // Si no está montado (SSR), no renderizamos nada para evitar el error de 'window'
  if (!mounted) return <div className="h-screen bg-[#020617]" />;

  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      <header className="flex justify-between items-center h-[6vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">Datacore Intel</h1>
        </div>
        <div className="flex items-center gap-4">
          {eventos.length > 0 && (
            <button 
              onClick={() => { if(confirm("¿Limpiar base de datos?")) { localStorage.removeItem('datacore_data'); setEventos([]); } }} 
              className="text-[10px] bg-red-500/10 text-red-400 px-3 py-1 rounded border border-red-500/20 font-bold uppercase hover:bg-red-500/20 transition-all"
            >
              <Trash2 size={12} className="inline mr-1"/> Limpiar
            </button>
          )}
          <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 uppercase font-mono">
            {eventosFiltrados.length} Registros Activos
          </div>
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-[#0f172a] p-10 rounded-3xl border border-slate-800 shadow-2xl">
            <FileUploader onDataLoaded={setEventos} />
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            {/* PANEL DE FILTROS */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-lg">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Filter size={12}/> Filtros Tácticos</h3>
              <div className="space-y-3">
                <select 
                  value={municipio}
                  onChange={e => setMunicipio(e.target.value)} 
                  className="w-full bg-[#020617] border border-slate-700 p-2 rounded-lg text-xs text-slate-300 outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">TODOS LOS MUNICIPIOS</option>
                  {municipiosUnicos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select 
                  value={delito}
                  onChange={e => setDelito(e.target.value)} 
                  className="w-full bg-[#020617] border border-slate-700 p-2 rounded-lg text-xs text-slate-300 outline-none focus:border-blue-500 transition-all"
                >
                  <option value="">TODAS LAS TIPOLOGÍAS</option>
                  {delitosUnicos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {/* PANEL TEMPORAL */}
            <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-lg">
              <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Calendar size={12}/> Rango Temporal</h3>
              <div className="px-2">
                <Slider 
                  range 
                  min={minTime} 
                  max={maxTime} 
                  value={rangoTemporal} 
                  onChange={val => setRangoTemporal(val as [number, number])} 
                  trackStyle={[{backgroundColor: '#3b82f6'}]} 
                  handleStyle={[{backgroundColor: '#3b82f6', border:'none', boxShadow: '0 0 10px #3b82f6'}]} 
                />
              </div>
              <div className="flex justify-between mt-3 text-[9px] text-slate-500 font-bold font-mono">
                <span className="bg-[#020617] p-1 rounded border border-slate-800">{toISODate(rangoTemporal[0])}</span>
                <span className="bg-[#020617] p-1 rounded border border-slate-800">{toISODate(rangoTemporal[1])}</span>
              </div>
            </div>

            {/* LOG OPERATIVO */}
            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl min-h-0">
              <div className="bg-slate-900/80 p-3 border-b border-slate-800 flex items-center gap-2">
                <List size={14} className="text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Log de Operaciones</span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar p-1">
                {eventosFiltrados.length > 0 ? (
                  eventosFiltrados.slice(0, 100).map((e, i) => (
                    <div key={i} className="p-2 mb-1 rounded-lg border border-transparent hover:border-slate-700 hover:bg-[#020617]/50 transition-all group">
                      <p className="text-blue-500 text-[9px] font-mono font-bold">{e.fecha}</p>
                      <p className="text-[10px] font-black text-slate-200 uppercase leading-tight group-hover:text-blue-400">{e.delito}</p>
                      <p className="text-[9px] text-slate-500 uppercase mt-1 font-semibold">{e.municipio}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-600 text-[10px] uppercase font-bold italic">Sin registros en este rango</div>
                )}
              </div>
            </div>
          </aside>

          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            {/* MAPA */}
            <div className="row-span-7 bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden relative shadow-2xl">
              <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md p-2 rounded-lg border border-slate-700 shadow-2xl">
                <p className="text-[9px] font-black text-white flex items-center gap-2 uppercase tracking-tighter">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                  Monitor de Inteligencia Córdoba-Antioquia
                </p>
              </div>
              <SecurityMap datos={eventosFiltrados} />
            </div>

            {/* ANALYTICS */}
            <div className="row-span-5 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-xl overflow-hidden">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
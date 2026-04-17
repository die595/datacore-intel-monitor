"use client";
import { useState, useMemo } from 'react';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import Analytics from './components/dashboard/Analytics';
import dynamic from 'next/dynamic';
import { Filter, MapPin, BookOpen, Calendar, List, Lock } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

// Importación dinámica del mapa para evitar errores en Netlify
const SecurityMap = dynamic(() => import('./components/dashboard/Map'), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-slate-900 animate-pulse flex items-center justify-center text-blue-500 font-mono text-[10px]">CARGANDO SISTEMA GEOGRÁFICO...</div>
});

export default function Home() {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- ESTADOS DEL DASHBOARD ---
  const [eventos, setEventos] = useState<EventoSeguridad[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState('');

  const minTime = new Date('2016-12-01').getTime();
  const maxTime = new Date('2026-03-07').getTime();
  const [rangoTemporal, setRangoTemporal] = useState<[number, number]>([minTime, maxTime]);

  // --- LÓGICA DE SEGURIDAD ---
  const checkPassword = () => {
    // CAMBIA AQUÍ TU CONTRASEÑA
    if (password === "Delta2026") {
      setIsAuthenticated(true);
    } else {
      alert("CREDENCIAL NO VÁLIDA - ACCESO DENEGADO");
    }
  };

  // --- LÓGICA DE DATOS ---
  const toISODate = (time: number) => new Date(time).toISOString().split('T')[0];

  const eventosFiltrados = useMemo(() => {
    return eventos.filter(e => {
      const matchMuni = !municipio || e.municipio === municipio;
      const matchDelito = !delito || e.delito === delito;
      const fechaE = new Date(e.fecha).getTime();
      const matchDate = isNaN(fechaE) ? true : (fechaE >= rangoTemporal[0] && fechaE <= rangoTemporal[1]);
      return matchMuni && matchDelito && matchDate;
    });
  }, [eventos, municipio, delito, rangoTemporal]);

  const municipiosUnicos = [...new Set(eventos.map(e => e.municipio))].sort();
  const delitosUnicos = [...new Set(eventos.map(e => e.delito))].sort();

  // --- RENDERIZADO: PANTALLA DE BLOQUEO ---
  if (!isAuthenticated) {
    return (
      <div className="h-screen bg-[#020617] flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 shadow-2xl w-full max-w-md border-t-4 border-t-blue-600">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/10 p-4 rounded-full border border-blue-500/20">
              <Lock className="text-blue-500" size={32} />
            </div>
          </div>
          <h2 className="text-white font-black uppercase tracking-[0.2em] text-center mb-2 text-xl">Datacore Intel</h2>
          <p className="text-slate-500 text-[10px] text-center uppercase font-bold mb-8 tracking-widest">Sistema de Análisis Estratégico</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-[9px] text-slate-500 font-bold uppercase mb-2 block ml-1">Credencial Operativa</label>
              <input 
                type="password" 
                placeholder="••••••••••••"
                className="w-full bg-[#020617] border border-slate-700 p-3 rounded text-white outline-none focus:border-blue-500 transition-all text-center tracking-widest"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPassword()}
              />
            </div>
            <button 
              onClick={checkPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded transition-all uppercase text-xs tracking-widest shadow-lg shadow-blue-900/20"
            >
              Autenticar Sistema
            </button>
          </div>
          
          <p className="text-[8px] text-slate-600 text-center mt-8 uppercase font-bold tracking-tighter">
            Acceso restringido a personal autorizado únicamente
          </p>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO: DASHBOARD PRINCIPAL ---
  return (
    <main className="h-screen bg-[#020617] text-slate-200 p-3 overflow-hidden flex flex-col font-sans">
      <header className="flex justify-between items-center h-[5vh] border-b border-slate-800 mb-2 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-blue-500" size={20} />
          <h1 className="text-lg font-black tracking-tighter text-white uppercase">Datacore Intel</h1>
        </div>
        <div className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded border border-blue-500/20 uppercase">
          {eventosFiltrados.length} Registros Activos
        </div>
      </header>

      {eventos.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <FileUploader onDataLoaded={setEventos} />
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          
          {/* COLUMNA IZQUIERDA: CONTROL + LOG */}
          <aside className="col-span-3 flex flex-col gap-3 min-h-0">
            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl shadow-lg">
              <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-2 italic"><Filter size={12}/> Filtros Tácticos</h3>
              <div className="space-y-2">
                <select onChange={e => setMunicipio(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-1.5 rounded text-[10px] text-slate-300 outline-none focus:border-blue-500">
                  <option value="">TODOS LOS MUNICIPIOS</option>
                  {municipiosUnicos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select onChange={e => setDelito(e.target.value)} className="w-full bg-[#020617] border border-slate-700 p-1.5 rounded text-[10px] text-slate-300 outline-none focus:border-blue-500">
                  <option value="">TODAS LAS TIPOLOGÍAS</option>
                  {delitosUnicos.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-[#0f172a] border border-slate-800 p-3 rounded-xl shadow-lg">
              <h3 className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 flex items-center gap-2 italic"><Calendar size={12}/> Temporalidad</h3>
              <Slider range min={minTime} max={maxTime} value={rangoTemporal} onChange={val => setRangoTemporal(val as [number, number])} trackStyle={[{backgroundColor: '#3b82f6'}]} handleStyle={[{backgroundColor: '#3b82f6', border:'none'}]} />
              <div className="flex justify-between mt-1 text-[8px] text-slate-500 font-bold uppercase">
                <span>{toISODate(rangoTemporal[0])}</span>
                <span>{toISODate(rangoTemporal[1])}</span>
              </div>
            </div>

            {/* LOG DE OPERACIONES */}
            <div className="flex-1 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl min-h-0">
              <div className="bg-slate-900/80 p-2 border-b border-slate-800 flex items-center gap-2">
                <List size={12} className="text-blue-500" />
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-mono">Log Operativo</span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                {eventosFiltrados.map((e, i) => (
                  <div key={i} className="p-2 border-b border-slate-800/50 hover:bg-blue-500/5 transition-all group">
                    <p className="text-blue-400 text-[8px] font-mono mb-1">{e.fecha}</p>
                    <p className="text-[9px] font-black text-slate-200 uppercase leading-none group-hover:text-blue-300">{e.delito}</p>
                    <p className="text-[8px] text-slate-500 uppercase mt-1">{e.municipio}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* COLUMNA DERECHA: MAPA + ANALYTICS */}
          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
              <div className="absolute top-2 left-2 z-[1000] bg-slate-900/90 backdrop-blur-sm p-1.5 rounded border border-slate-700">
                <p className="text-[8px] font-bold text-white flex items-center gap-1 uppercase tracking-tighter">
                  <MapPin size={10} className="text-red-500" /> Centro de Operaciones Córdoba-Antioquia
                </p>
              </div>
              <SecurityMap datos={eventosFiltrados} />
            </div>

            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-3 shadow-xl overflow-hidden">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
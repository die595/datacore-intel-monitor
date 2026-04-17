"use client";
import { useState, useMemo } from 'react';
import FileUploader, { EventoSeguridad } from './components/upload/FileUploader'; 
import Analytics from './components/dashboard/Analytics';
import SecurityMap from './components/dashboard/Map';
import { Filter, MapPin, BookOpen, Calendar, List } from 'lucide-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

export default function Home() {
  const [eventos, setEventos] = useState<EventoSeguridad[]>([]);
  const [municipio, setMunicipio] = useState('');
  const [delito, setDelito] = useState('');

  const minTime = new Date('2016-12-01').getTime();
  const maxTime = new Date('2026-03-07').getTime();
  const [rangoTemporal, setRangoTemporal] = useState<[number, number]>([minTime, maxTime]);

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
        <div className="flex-1 flex items-center justify-center"><FileUploader onDataLoaded={setEventos} /></div>
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

            {/* LOG DE OPERACIONES (Ocupando el espacio lateral) */}
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

          {/* COLUMNA DERECHA: MAPA (Superior) + ANALYTICS DIVIDIDO (Inferior) */}
          <div className="col-span-9 grid grid-rows-12 gap-3 min-h-0">
            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden relative shadow-2xl">
              <div className="absolute top-2 left-2 z-[1000] bg-slate-900/90 backdrop-blur-sm p-1.5 rounded border border-slate-700">
                <p className="text-[8px] font-bold text-white flex items-center gap-1 uppercase tracking-tighter">
                  <MapPin size={10} className="text-red-500" /> Centro de Operaciones Córdoba-Antioquia
                </p>
              </div>
              <SecurityMap datos={eventosFiltrados} />
            </div>

            {/* Analytics dividido internamente */}
            <div className="row-span-6 bg-[#0f172a] border border-slate-800 rounded-xl p-3 shadow-xl overflow-hidden">
              <Analytics datos={eventosFiltrados} />
            </div>
          </div>

        </div>
      )}
    </main>
  );
}
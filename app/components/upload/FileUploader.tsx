"use client";
import React from 'react';
// @ts-ignore
import Papa from 'papaparse'; 
import { UploadCloud } from 'lucide-react';

// EXPORTAMOS la interfaz actualizada
export interface EventoSeguridad {
  fecha: string;
  hora: string;
  departamento: string;
  municipio: string;
  vereda: string;
  latitud: number;
  longitud: number;
  delito: string;
  informacion: string;
  fenomeno: string;
  armas: string;
  actor_implicado: string;
}

interface FileUploaderProps {
  onDataLoaded: (data: EventoSeguridad[]) => void;
}

export default function FileUploader({ onDataLoaded }: FileUploaderProps) {
  
  // Función interna para limpiar coordenadas con comas (7,71 -> 7.71)
  const limpiarCoordenada = (valor: any): number => {
    if (!valor) return 0;
    // Convierte a string, cambia coma por punto y limpia espacios
    const stringVal = String(valor).replace(',', '.').trim();
    const numero = parseFloat(stringVal);
    return isNaN(numero) ? 0 : numero;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const datosMapeados: EventoSeguridad[] = results.data
          .filter((fila: any) => fila['FECHA  DEL HECHO'] || fila['LATITUD']) 
          .map((fila: any) => ({
            fecha: String(fila['FECHA  DEL HECHO'] || ''),
            hora: String(fila['HORA HECHO'] || ''),
            departamento: String(fila['DEPARTAMENTO'] || ''),
            municipio: String(fila['MUNICIPIO'] || ''),
            // Captura flexible para la columna de Vereda
            vereda: String(fila['CORREGIMIENTO\nVEREDA'] || fila['CORREGIMIENTO / VEREDA'] || fila['CORREGIMIENTO VEREDA'] || ''),
            
            // PROCESAMIENTO DE COORDENADAS (Soporta 7,71708...)
            latitud: limpiarCoordenada(fila['LATITUD']),
            longitud: limpiarCoordenada(fila['LONGITUD']),
            
            // NORMALIZACIÓN DE TIPOLOGÍA (Convierte a Mayúsculas para coincidir con tu lista)
            delito: String(fila['TIPOLOGÍA DEL DELITO'] || '').trim().toUpperCase(),
            
            informacion: String(fila['INFORMACIÓN / HECHO'] || ''),
            fenomeno: String(fila['FENOMENO DE CRIMINALIDAD'] || ''),
            armas: String(fila['ARMAS O MEDIOS'] || ''),
            actor_implicado: String(fila['ESTRUCTURA'] || '')
          }));

        // Filtrar registros que no tengan coordenadas válidas para evitar errores en el mapa
        const datosValidos = datosMapeados.filter(d => d.latitud !== 0 && d.longitud !== 0);
        
        console.log(`Cargados ${datosValidos.length} puntos tácticos.`);
        onDataLoaded(datosValidos);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <label 
        htmlFor="csv-upload" 
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-700 rounded-2xl bg-[#0f172a]/50 hover:bg-[#0f172a] hover:border-blue-500/50 transition-all cursor-pointer group shadow-2xl shadow-blue-500/5"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
          <div className="p-4 mb-4 rounded-full bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <UploadCloud size={40} />
          </div>
          <p className="mb-2 text-sm text-slate-200 font-semibold uppercase tracking-tight">
            Cargar Sistema de Inteligencia Táctica
          </p>
          <p className="text-[10px] text-slate-500 italic uppercase tracking-[0.2em]">
            Formatos: CSV (Soporta coordenadas 7,71 y 7.71)
          </p>
        </div>
        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
      </label>
    </div>
  );
}
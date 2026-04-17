"use client";
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { EventoSeguridad } from '../upload/FileUploader';

interface AnalyticsProps {
  datos: EventoSeguridad[];
}

export default function Analytics({ datos }: AnalyticsProps) {
  
  // 1. Procesar Datos para Tipología (Barras Horizontales Pro)
  const dataTipologia = useMemo(() => {
    // Lista oficial que me pasaste
    const categoriasOficiales = [
      "ACTIVACION ARTEFACTO EXPLOSIVO", "ACTO DE TERRORISMO", "AHOGADO",
      "APOYO HUMANITARIO", "ATAQUE FUERZA PUBLICA", "CADAVERES",
      "CAMPAMENTO", "CAPTURA PERSONA", "COMBATE", "DEPOSITO ILEGAL",
      "DESTRUCCION", "EXPLORACION Y EXPLOTACION ILICITA", "EXTINCION DE DOMINIO",
      "EXTORCION", "INCAUTACION", "LIBERADOS", "INMVOILIZACION MEDIO TRANSPORTE",
      "MUERTES CAUSAS DEL SERVICIO", "NARCOTRAFICO", "NEUTRALIZACION ARTEFACTO EXPLOSIVO",
      "PATRULLAJE", "PRESENTACION VOLUNTARIA", "RECUPERADO", "RESCATES",
      "SIEMBRA", "SOMETIMIENTO A LA JUSTICIA"
    ];

    const conteo = datos.reduce((acc: any, curr) => {
      const tipo = curr.delito?.toUpperCase().trim();
      if (tipo) acc[tipo] = (acc[tipo] || 0) + 1;
      return acc;
    }, {});

    return categoriasOficiales
      .map(cat => ({
        name: cat,
        cantidad: conteo[cat] || 0
      }))
      .filter(item => item.cantidad > 0) // Solo mostrar las que tienen datos
      .sort((a, b) => b.cantidad - a.cantidad); // De mayor a menor
  }, [datos]);

  // 2. Procesar Datos por Municipio
  const dataMunicipio = useMemo(() => {
    const conteo = datos.reduce((acc: any, curr) => {
      const muni = curr.municipio?.toUpperCase().trim();
      if (muni) acc[muni] = (acc[muni] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(conteo)
      .map(muni => ({ name: muni, cantidad: conteo[muni] }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10 municipios
  }, [datos]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#020617] border border-slate-700 p-2 rounded-lg shadow-xl">
          <p className="text-[10px] font-bold text-blue-400 mb-1">{label}</p>
          <p className="text-sm font-black text-white">{payload[0].value} Eventos</p>
        </div>
      );
    }
    return null;
  };

  return (
  <div className="grid grid-cols-2 gap-4 h-full">
    
    {/* PARTE 1: DISTRIBUCIÓN TÁCTICA (Izquierda) */}
    <div className="flex flex-col h-full border-r border-slate-800/50 pr-2">
      <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
        Distribución por Tipología
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataTipologia} layout="vertical" margin={{ left: 10, right: 30 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              width={120} 
              tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 'bold' }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b', opacity: 0.4 }} />
            <Bar dataKey="cantidad" radius={[0, 4, 4, 0]} barSize={10} fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

    {/* PARTE 2: FRECUENCIA POR MUNICIPIO (Derecha) */}
    <div className="flex flex-col h-full pl-2">
      <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        Frecuencia por Municipio
      </h3>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dataMunicipio} margin={{ bottom: 20 }}>
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 8 }} 
              angle={-25}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 8 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="cantidad" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>

  </div>
);
}

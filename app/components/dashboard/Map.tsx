"use client";
import { MapContainer, TileLayer, CircleMarker, Popup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { EventoSeguridad } from '../upload/FileUploader';

export default function SecurityMap({ datos }: { datos: EventoSeguridad[] }) {
  // Centro inicial en la zona de operaciones (Córdoba/Antioquia)
  const center: [number, number] = [7.9792, -75.4172];

  return (
    <div className="h-full w-full rounded-xl overflow-hidden relative border border-slate-800">
      <MapContainer center={center} zoom={8} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false}>
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <ZoomControl position="bottomright" />

        {datos.map((e, idx) => {
          if (!e.latitud || !e.longitud || e.latitud === 0) return null;

          return (
            <CircleMarker
              key={idx}
              center={[e.latitud, e.longitud]}
              radius={5}
              pathOptions={{
                fillColor: '#3b82f6',
                color: '#60a5fa',
                weight: 1,
                fillOpacity: 0.8
              }}
            >
              <Popup>
                <div className="text-[#0f172a] text-[10px] w-64 flex flex-col font-sans">
                  <p className="font-black text-blue-700 uppercase border-b border-slate-200 mb-1 pb-1">
                    {e.delito}
                  </p>
                  <p className="m-0"><b>UBICACIÓN:</b> {e.municipio} ({e.vereda})</p>
                  <p className="m-0"><b>FECHA:</b> {e.fecha} - {e.hora}</p>
                  
                  {/* CAMPO CON SCROLL VERTICAL PARA EL MENSAJE */}
                  <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded max-h-[100px] overflow-y-auto custom-popup-scroll italic text-slate-700 leading-snug">
                    {e.informacion}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <style jsx global>{`
        .custom-popup-scroll::-webkit-scrollbar { width: 4px; }
        .custom-popup-scroll::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-popup-scroll::-webkit-scrollbar-thumb { background: #3b82f6; border-radius: 10px; }
        .leaflet-popup-content-wrapper { border-radius: 8px; padding: 5px; }
      `}</style>
    </div>
  );
}
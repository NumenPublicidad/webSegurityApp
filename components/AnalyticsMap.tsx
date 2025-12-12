'use client';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertData } from '@/types';
import { Timestamp } from 'firebase/firestore'; // <--- 1. IMPORTANTE: Importar Timestamp

// Coordenadas centrales por defecto (Buenos Aires aprox)
const CENTER = [-34.55, -58.45]; 

export default function AnalyticsMap({ alerts }: { alerts: AlertData[] }) {

  // --- 2. FUNCIÓN AUXILIAR PARA FECHAS (Elimina el error de 'any') ---
  const formatDate = (dateVal: Timestamp | Date | null | undefined) => {
    if (!dateVal) return '---';
    
    // Si es un Timestamp de Firebase, usamos .toDate()
    if (dateVal instanceof Timestamp) {
      return dateVal.toDate().toLocaleDateString();
    }
    
    // Si ya es una fecha de JS o un string convertible
    return new Date(dateVal).toLocaleDateString();
  };

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      <MapContainer 
        center={[CENTER[0], CENTER[1]]} 
        zoom={11} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {alerts.map((alert) => {
          if (!alert.location) return null;
          
          const color = 
            alert.type === 'SOS' ? '#ef4444' : 
            alert.type === 'INCENDIO' ? '#f97316' : 
            '#3b82f6'; 

          return (
            <CircleMarker 
              key={alert.id}
              center={[alert.location.latitude, alert.location.longitude]}
              radius={8}
              pathOptions={{ color: color, fillColor: color, fillOpacity: 0.6, weight: 1 }}
            >
              <Popup>
                <div className="text-xs">
                  <strong>{alert.type}</strong><br/>
                  {alert.userName}<br/>
                  {/* 3. USAMOS LA FUNCIÓN SEGURA AQUÍ */}
                  {formatDate(alert.timestamp)}
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
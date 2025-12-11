'use client';
import React from "react";
import { AlertData } from '@/types';
import { 
  User, 
  Phone, 
  CheckCircle, 
  X, 
  Clock, 
  MapPin,
  Flame,
  Stethoscope,
  Siren,
  History
} from 'lucide-react';
import { Timestamp } from "firebase/firestore";

const AlertDetailModal: React.FC<{
  alert: AlertData;
  onClose: () => void;
  onResolve: (id: string) => void;
}> = ({ alert, onClose, onResolve }) => {

  const lat = alert.location?.latitude || 0;
  const lng = alert.location?.longitude || 0;
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  const formatDate = (dateObj: Timestamp | Date | null) => {
    if (!dateObj) return '---';
    if (dateObj instanceof Timestamp) return dateObj.toDate().toLocaleString();
    return new Date(dateObj).toLocaleString();
  };
  const getAlertStyle = (type: string) => {
    const t = (type || '').toLowerCase().trim();

    if (t === 'ambulancia') {
      return {
        style: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: <Stethoscope className="w-4 h-4" />
      };
    }
    if (t === 'incendio') {
      return {
        style: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: <Flame className="w-4 h-4" />
      };
    }
    return {
      style: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
      icon: <Siren className="w-4 h-4" />
    };
  };

  const badgeConfig = getAlertStyle(alert.type);
  const isResolved = alert.status === 'resolved' || alert.status === 'cancelled';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden border border-slate-200">
        
        {/* Panel Izquierdo: Información */}
        <div className="w-full md:w-[400px] bg-slate-50 flex flex-col border-r border-slate-200 z-10 shadow-xl">
          
          {/* Header del Modal */}
          <div className="p-6 border-b border-slate-200 bg-white">
            <div className="flex justify-between items-start mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${badgeConfig.style}`}>
                {badgeConfig.icon}
                {(alert.type || 'ALERTA').toUpperCase()}
              </span>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight mb-1">{alert.userName}</h2>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Clock className="w-4 h-4" />
              {formatDate(alert.timestamp)}
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {/* Datos Personales */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Datos del Ciudadano
              </h3>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Documento (DNI)</div>
                  <div className="font-bold text-slate-800 text-lg">{alert.userDni || 'No registrado'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-green-50 rounded-lg">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Teléfono Celular</div>
                  <div className="font-bold text-slate-800 text-lg font-mono">{alert.userPhone || '---'}</div>
                </div>
              </div>
            </div>

            {/* Datos Geográficos */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                 Coordenadas GPS
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500 mb-1">Latitud</div>
                   <div className="font-mono text-sm font-semibold text-slate-700">{lat}</div>
                 </div>
                 <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                   <div className="text-xs text-slate-500 mb-1">Longitud</div>
                   <div className="font-mono text-sm font-semibold text-slate-700">{lng}</div>
                 </div>
               </div>
               <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                 <MapPin className="w-3 h-3" /> Precisión según dispositivo móvil
               </div>
            </div>
          </div>

          {!isResolved ? (
            <div className="p-6 bg-white border-t border-slate-200">
              <button
                onClick={() => onResolve(alert.id)}
                className="group w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                <CheckCircle className="w-5 h-5 group-hover:text-green-400 transition-colors" />
                CERRAR EVENTO (RESUELTO)
              </button>
              <p className="text-center text-xs text-slate-400 mt-3">
                Al cerrar el evento, cambiará a estado <span className="font-mono text-slate-600">resolved</span>
              </p>
            </div>
          ) : (
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="w-full py-4 bg-slate-200 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-300">
                <History className="w-5 h-5" />
                EVENTO FINALIZADO
              </div>
              <p className="text-center text-xs text-slate-500 mt-3 flex justify-center items-center gap-1">
                Este evento fue cerrado como: 
                <span className={`font-mono font-bold uppercase ${alert.status === 'cancelled' ? 'text-red-600' : 'text-green-600'}`}>
                  {alert.status}
                </span>
              </p>
            </div>
          )}

        </div>

        {/* Mapa a Pantalla Completa (Lado Derecho) */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            src={mapUrl}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-slate-200 text-xs font-bold text-slate-700 pointer-events-none z-10">
            VISTA SATELITAL EN VIVO
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertDetailModal;
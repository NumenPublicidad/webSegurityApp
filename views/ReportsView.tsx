'use client';
import { useState } from 'react';
import { 
  CheckCircle, Navigation, Clock, User, Phone, 
  Flame, Stethoscope, Siren, History, XCircle, CheckSquare, 
  ArrowLeft // Importante para el botón volver
} from 'lucide-react';
import { AlertData, ViewState } from '@/types'; // Importamos ViewState
import { Timestamp } from 'firebase/firestore';

export default function ReportsView({
  activeAlerts,
  historyAlerts,
  setSelectedAlert,
  setView // <--- AHORA SÍ RECIBIMOS ESTA PROPIEDAD
}: {
  activeAlerts: AlertData[];
  historyAlerts: AlertData[];
  setSelectedAlert: (a: AlertData | null) => void;
  setView: (v: ViewState) => void; // <--- DEFINIMOS SU TIPO AQUÍ
}) {

  const [tab, setTab] = useState<'active' | 'history'>('active');

  const getAlertStyle = (type: string) => {
    const t = (type || '').toLowerCase().trim();
    if (t === 'ambulancia') return { style: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Stethoscope className="w-3.5 h-3.5" /> };
    if (t === 'incendio') return { style: 'bg-orange-100 text-orange-700 border-orange-200', icon: <Flame className="w-3.5 h-3.5" /> };
    return { style: 'bg-red-100 text-red-700 border-red-200 animate-pulse', icon: <Siren className="w-3.5 h-3.5" /> };
  };

  const formatTime = (ts: Timestamp | Date | null | undefined) => {
    if (!ts) return '---';
    const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    return date.toLocaleString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4 mb-6">

        {/* Título y Pestañas */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              {tab === 'active' ? 'Alertas en Curso' : 'Historial de Eventos'}
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              {tab === 'active' 
                ? 'Monitoreo en tiempo real de situaciones de emergencia.' 
                : 'Registro de alertas resueltas por el operador o canceladas por el usuario.'}
            </p>
          </div>

          <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setTab('active')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                tab === 'active' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <Siren className="w-4 h-4" /> Activas ({activeAlerts.length})
            </button>
            <button
              onClick={() => setTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                tab === 'history' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <History className="w-4 h-4" /> Historial ({historyAlerts.length})
            </button>
          </div>
        </div>
      </div>

      {/* --- TABLA DE DATOS --- */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario / Contacto</th>
                
                {tab === 'history' && (
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Estado Final</th>
                )}
                
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">
                  {tab === 'active' ? 'Hora Inicio' : 'Fecha y Hora'}
                </th>
                
                {tab === 'active' && (
                   <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acción</th>
                )}
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {(tab === 'active' ? activeAlerts : historyAlerts).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center opacity-50">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        {tab === 'active' ? <CheckCircle className="w-8 h-8 text-slate-400" /> : <History className="w-8 h-8 text-slate-400" />}
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {tab === 'active' ? 'Sin Alertas Activas' : 'Historial Vacío'}
                      </h3>
                    </div>
                  </td>
                </tr>
              ) : (
                (tab === 'active' ? activeAlerts : historyAlerts).map((alert) => {
                  const badgeConfig = getAlertStyle(alert.type);

                  return (
                    <tr 
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className="group cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      {/* TIPO */}
                      <td className="px-6 py-4 w-40">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm uppercase ${badgeConfig.style}`}>
                          {badgeConfig.icon}
                          {alert.type}
                        </span>
                      </td>

                      {/* USUARIO */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 mt-1">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">{alert.userName}</span>
                            <span className="text-xs text-slate-500 font-mono mt-0.5">DNI: {alert.userDni || '---'}</span>
                            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 mt-1 bg-slate-50 px-1.5 py-0.5 rounded w-fit border border-slate-100">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {alert.userPhone || 'Sin N°'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ESTADO (SOLO EN HISTORIAL) */}
                      {tab === 'history' && (
                        <td className="px-6 py-4 text-center">
                          {alert.status === 'resolved' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                              <CheckSquare className="w-3 h-3" /> RESUELTO (WEB)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                              <XCircle className="w-3 h-3" /> CANCELADO (APP)
                            </span>
                          )}
                        </td>
                      )}

                      {/* HORA */}
                      <td className="px-6 py-4">
                         <span className="text-xs font-medium text-slate-600 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded w-fit">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {formatTime(alert.timestamp)}
                         </span>
                      </td>

                      {/* ACCIÓN (SOLO EN ACTIVAS) */}
                      {tab === 'active' && (
                        <td className="px-6 py-4 text-right w-40">
                           <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 bg-blue-50 px-3 py-1.5 rounded-full">
                             Ver Mapa <Navigation className="w-3 h-3" />
                           </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
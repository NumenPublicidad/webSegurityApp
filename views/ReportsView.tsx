'use client';
import { CheckCircle, AlertTriangle, Navigation, Clock, User, Phone } from 'lucide-react';
import { AlertData } from '@/types';
import { Timestamp } from 'firebase/firestore';

export default function ReportsView({
  activeAlerts,
  setSelectedAlert
}: {
  activeAlerts: AlertData[];
  setSelectedAlert: (a: AlertData | null) => void;
}) {
  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Alertas en Curso
            {activeAlerts.length > 0 ? (
              <span className="px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full border border-red-200 animate-pulse flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                {activeAlerts.length} Pendientes
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200 flex items-center gap-2">
                <CheckCircle className="w-3 h-3" /> Todo Normal
              </span>
            )}
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Haz clic en una fila para ver la ubicación geográfica y gestionar el evento.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuario</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Hora</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeAlerts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-800">Sin Alertas Activas</h3>
                      <p className="text-slate-500 text-sm mt-1">El sistema está monitoreando en tiempo real.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                activeAlerts.map((alert) => (
                  <tr 
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className="group cursor-pointer hover:bg-blue-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 shadow-sm group-hover:scale-105 transition-transform uppercase">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{alert.userName}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">DNI: {alert.userDni || '---'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-600 font-mono text-xs bg-slate-50 px-2 py-1 rounded w-fit">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {alert.userPhone || 'No registrado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                       <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {alert.timestamp instanceof Timestamp 
                            ? alert.timestamp.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                            : '---'}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0 duration-300 bg-blue-50 px-3 py-1.5 rounded-full">
                         Ver Mapa <Navigation className="w-3 h-3" />
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

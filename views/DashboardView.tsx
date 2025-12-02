'use client';
import { Users, AlertTriangle } from 'lucide-react';
import { AppView } from '@/types';

export default function DashboardView({
  setView,
  activeAlerts
}: {
  setView: (v: AppView) => void;
  activeAlerts: unknown[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button
        onClick={() => setView('users')}
        className="group relative overflow-hidden bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-purple-200 transition-all duration-300 text-left"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <Users className="w-12 h-12 text-purple-600 mb-6 relative z-10" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Usuarios</h2>
        <p className="text-slate-500 relative z-10 text-sm">Base de datos de ciudadanos registrados.</p>
      </button>

      <button
        onClick={() => setView('reports')}
        className="group relative overflow-hidden bg-white p-10 rounded-3xl shadow-sm border border-slate-200 hover:shadow-2xl hover:border-red-200 transition-all duration-300 text-left"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

        <div className="relative z-10 flex justify-between items-start">
          <AlertTriangle className="w-12 h-12 text-red-600 mb-6" />
          {activeAlerts.length > 0 && (
            <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-sm animate-pulse shadow-lg shadow-red-200">
              {activeAlerts.length} ACTIVAS
            </span>
          )}
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2 relative z-10">Reporte Web</h2>
        <p className="text-slate-500 relative z-10 text-sm">Monitoreo en tiempo real de eventos de pánico y SOS.</p>
      </button>
    </div>
  );
}

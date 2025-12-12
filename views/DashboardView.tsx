'use client';
import { Users, AlertTriangle, BarChart3 } from 'lucide-react';
import { AppView, AlertData } from '@/types'; // <--- 1. Importamos AlertData

export default function DashboardView({
  setView,
  activeAlerts
}: {
  setView: (v: AppView) => void;
  activeAlerts: AlertData[]; // <--- 2. Reemplazamos 'any[]' por 'AlertData[]'
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* TARJETA 1: USUARIOS */}
      <button
        onClick={() => setView('users')}
        className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-purple-200 transition-all duration-300 text-left h-64 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <Users className="w-10 h-10 text-purple-600 relative z-10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Usuarios</h2>
          <p className="text-slate-500 text-sm">Base de datos de ciudadanos.</p>
        </div>
      </button>

      {/* TARJETA 2: REPORTE WEB (ALERTAS) */}
      <button
        onClick={() => setView('reports')}
        className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-red-200 transition-all duration-300 text-left h-64 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <div className="relative z-10 flex justify-between items-start w-full">
          <AlertTriangle className="w-10 h-10 text-red-600" />
          {activeAlerts.length > 0 && (
            <span className="bg-red-600 text-white font-bold px-3 py-1 rounded-full text-xs animate-pulse">
              {activeAlerts.length}
            </span>
          )}
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Reporte Web</h2>
          <p className="text-slate-500 text-sm">Monitoreo en tiempo real.</p>
        </div>
      </button>

      {/* TARJETA 3: ESTADÍSTICAS */}
      <button
        onClick={() => setView('analytics')}
        className="group relative overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 text-left h-64 flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
        <BarChart3 className="w-10 h-10 text-blue-600 relative z-10" />
        <div className="relative z-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Estadísticas</h2>
          <p className="text-slate-500 text-sm">Gráficos y reportes PDF.</p>
        </div>
      </button>

    </div>
  );
}
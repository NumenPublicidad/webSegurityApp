'use client';
import { LogOut, Shield, Users, LayoutDashboard } from 'lucide-react';
import { UserRole, AppView } from '@/types';

export default function Navbar({
  role,
  view,
  setView,
  handleLogout
}: {
  role: UserRole | null;
  view: AppView;
  setView: (v: AppView) => void;
  handleLogout: () => void;
}) {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-4 flex items-center justify-between shadow-sm">
      
      {/* --- LADO IZQUIERDO: LOGO E INFORMACIÓN --- */}
      <div className="flex items-center gap-4">
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-lg shadow-slate-200">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-800 leading-none text-lg">Panel de Seguridad</h1>

          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2 h-2 rounded-full ${role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
            
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {role === 'admin' ? 'Administrador' : 'Operador Monitoreo'}
            </span>
          </div>
        </div>
      </div>

      {/* --- LADO DERECHO: BOTONES DE NAVEGACIÓN --- */}
      <div className="flex items-center gap-2">
        {role === 'admin' && view !== 'users' && (
          <button
            onClick={() => setView('users')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition-all px-3 py-2 rounded-lg border border-transparent hover:border-blue-100"
            title="Ver base de datos de usuarios"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Usuarios</span>
          </button>
        )}
        {role === 'admin' && view !== 'dashboard' && (
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-all px-3 py-2 rounded-lg border border-transparent hover:border-purple-100"
            title="Volver al inicio"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        )}
        <div className="h-6 w-px bg-slate-200 mx-2"></div>

        {/* BOTÓN 3: CERRAR SESIÓN */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 border border-transparent hover:border-red-100 rounded-lg text-sm font-medium transition-all"
          title="Cerrar sesión actual"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}
'use client';
import { LogOut, Shield } from 'lucide-react';
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

      <div className="flex items-center gap-3">
        {role === 'admin' && view !== 'dashboard' && (
          <button
            onClick={() => setView('dashboard')}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-3 py-2"
          >
            Menú Principal
          </button>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 hover:text-red-600 text-slate-700 rounded-lg text-sm font-medium transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </nav>
  );
}

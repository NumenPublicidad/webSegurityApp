'use client';
import { Users } from 'lucide-react';
import { ViewState } from '@/types';

export default function UsersView({ setView }: { setView: (v: ViewState) => void }) {
  return (
    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-slate-300" />
      </div>
      <h2 className="text-xl font-bold text-slate-800">Módulo de Usuarios</h2>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">Aquí podrás ver, editar y gestionar la lista completa de usuarios registrados en la app móvil.</p>
      <button onClick={() => setView('dashboard')} className="text-blue-600 font-bold hover:text-blue-800 hover:underline">
        ← Volver al Dashboard
      </button>
    </div>
  );
}

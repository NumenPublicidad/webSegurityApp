'use client';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  UserCheck, 
  UserX, 
  Trash2, 
  TriangleAlert, 
  ArrowLeft, 
  X              
} from 'lucide-react';
import { ViewState } from '@/types'; 
import { db } from '@/firebase/config';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';

interface AppUser {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  dni: string;
  phone: string;
  role: 'admin' | 'monitoreo' | 'user';
  status?: 'active' | 'disabled'; 
  createdAt?: string;
}

export default function UsersView({ setView }: { setView: (v: ViewState) => void }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [userToBlock, setUserToBlock] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Cargar usuarios
  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as AppUser[];
      setUsers(fetchedUsers);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Buscador
  const filteredUsers = users.filter(u => {
    const term = searchTerm.toLowerCase();
    
    const fName = String(u.firstName || '').toLowerCase();
    const lName = String(u.lastName || '').toLowerCase();
    const dni = String(u.dni || ''); 
    const email = String(u.email || '').toLowerCase();

    return fName.includes(term) ||
           lName.includes(term) ||
           dni.includes(term) ||
           email.includes(term);
  });

  // 3. Cambiar Rol
  const cycleRole = async (user: AppUser) => {
    const roles: AppUser['role'][] = ['user', 'monitoreo', 'admin'];
    const currentRole = user.role || 'user';
    const nextIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIndex];
    try {
      await updateDoc(doc(db, 'users', user.uid), { role: nextRole });
    } catch (error) {
      console.error(error);
    }
  };

  // 4. Lógica de Bloqueo
  const handleStatusClick = async (user: AppUser) => {
    const currentStatus = user.status || 'active';
    if (currentStatus === 'active') {
        setUserToBlock(user);
    } else {
        await executeStatusChange(user, 'active');
    }
  };

  const executeStatusChange = async (user: AppUser, newStatus: 'active' | 'disabled') => {
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { status: newStatus });
      setUserToBlock(null);
    } catch (error) {
      console.error("Error cambiando estado:", error);
      alert("Error al actualizar estado");
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. Lógica de Eliminación
  const handleDeleteClick = (user: AppUser) => {
    setUserToDelete(user);
  };

  const executeDelete = async () => {
    if (!userToDelete) return;
    setIsProcessing(true);
    try {
      await deleteDoc(doc(db, 'users', userToDelete.uid));
      setUserToDelete(null);
    } catch (error) {
      console.error("Error borrando usuario:", error);
      alert("Error al eliminar el usuario.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 relative">
      
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>

          <button 
            onClick={() => setView('dashboard')} 
            className="text-sm text-slate-500 hover:text-blue-600 mb-2 font-bold flex items-center gap-2 transition-all hover:-translate-x-1"
          >
             <ArrowLeft className="w-4 h-4" /> 
             Volver al Dashboard
          </button>
       

          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Usuarios Registrados
            <span className="bg-slate-100 text-slate-600 text-sm py-1 px-3 rounded-full border border-slate-200">
              Total: {users.length}
            </span>
          </h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar por DNI, Nombre..." 
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usuario</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contacto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Rol</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Estado</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Cargando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Sin resultados.</td></tr>
              ) : (
                filteredUsers.map((user) => {
                  const isBanned = user.status === 'disabled';
                  return (
                    <tr key={user.uid} className={`hover:bg-slate-50 transition-colors ${isBanned ? 'bg-red-50/40' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isBanned ? 'bg-red-100 border-red-200 text-red-500' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div>
                            <div className={`font-bold text-sm ${isBanned ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-slate-500 font-mono">DNI: {user.dni}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{user.email}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => cycleRole(user)} className={`px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 cursor-pointer select-none flex items-center gap-1 mx-auto ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : user.role === 'monitoreo' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {(user.role || 'user').toUpperCase()}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleStatusClick(user)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-colors shadow-sm
                            ${isBanned 
                              ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'}`}
                        >
                          {isBanned ? <><UserX className="w-3 h-3" /> INHABILITADO</> : <><UserCheck className="w-3 h-3" /> ACTIVO</>}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteClick(user)} 
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: INAHABILITAR */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-orange-50 p-6 flex flex-col items-center justify-center text-center border-b border-orange-100">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-orange-50">
                <TriangleAlert className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">¿Inhabilitar usuario?</h3>
              <p className="text-slate-500 text-sm mt-2">
                Estás a punto de bloquear temporalmente a:
              </p>
              <div className="mt-2 font-bold text-slate-800 text-lg bg-white px-4 py-1 rounded-lg border border-orange-100 shadow-sm">
                 {userToBlock.firstName} {userToBlock.lastName}
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm text-center mb-6">
                Este usuario <span className="font-bold">no podrá iniciar sesión</span> ni enviar alertas.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setUserToBlock(null)} className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors" disabled={isProcessing}>
                  Cancelar
                </button>
                <button onClick={() => executeStatusChange(userToBlock, 'disabled')} disabled={isProcessing} className="flex-1 py-3 px-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all flex justify-center items-center gap-2">
                  {isProcessing ? "Procesando..." : <><UserX className="w-4 h-4" /> Bloquear</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ELIMINAR */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-red-50 p-6 flex flex-col items-center justify-center text-center border-b border-red-100">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-red-50">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">¿Eliminar permanentemente?</h3>
              <p className="text-slate-500 text-sm mt-2">
                Estás a punto de borrar todos los datos de:
              </p>
              <div className="mt-2 font-bold text-slate-800 text-lg bg-white px-4 py-1 rounded-lg border border-red-100 shadow-sm">
                 {userToDelete.firstName} {userToDelete.lastName}
              </div>
            </div>
            <div className="p-6">
              <p className="text-slate-600 text-sm text-center mb-6 leading-relaxed">
                <span className="font-bold text-red-600 uppercase">¡Cuidado!</span> Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors" disabled={isProcessing}>
                  Cancelar
                </button>
                <button onClick={executeDelete} disabled={isProcessing} className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all flex justify-center items-center gap-2">
                  {isProcessing ? "Borrando..." : <><Trash2 className="w-4 h-4" /> Eliminar</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
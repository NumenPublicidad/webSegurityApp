'use client';
import { useState, useEffect } from 'react';
import { 
  Users, Search, UserCheck, UserX, Trash2, 
  TriangleAlert, ArrowLeft, FileText, Calendar, 
  Download, Loader2
} from 'lucide-react';
import { db } from '@/firebase/config';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query, Timestamp } from 'firebase/firestore';
import { ViewState, UserRole, AppUser } from '@/types';

// IMPORTAMOS EL SERVICIO NUEVO
import { generatePDFReport } from '@/services/reportService';


export default function UsersView({ setView, role }: { setView: (v: ViewState) => void; role: UserRole | null }) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modales
  const [userToBlock, setUserToBlock] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  
  // --- ESTADOS PARA REPORTE ---
  const [showReportModal, setShowReportModal] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
    return fName.includes(term) || lName.includes(term) || dni.includes(term) || email.includes(term);
  });

  // Funciones auxiliares
  const cycleRole = async (user: AppUser) => {
    const roles: AppUser['role'][] = ['user', 'monitoreo', 'admin'];
    const currentRole = user.role || 'user';
    const nextIndex = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIndex];
    try { await updateDoc(doc(db, 'users', user.uid), { role: nextRole }); } catch (e) { console.error(e); }
  };

  const handleStatusClick = async (user: AppUser) => {
    if ((user.status || 'active') === 'active') setUserToBlock(user);
    else await executeStatusChange(user, 'active');
  };

  const executeStatusChange = async (user: AppUser, newStatus: 'active' | 'disabled') => {
    try { await updateDoc(doc(db, 'users', user.uid), { status: newStatus }); setUserToBlock(null); } 
    catch (e) { alert("Error al actualizar"); }
  };

  const handleDeleteClick = (user: AppUser) => setUserToDelete(user);
  
  const executeDelete = async () => {
    if (!userToDelete) return;
    try { await deleteDoc(doc(db, 'users', userToDelete.uid)); setUserToDelete(null); } 
    catch (e) { alert("Error al eliminar"); }
  };

  // --- FUNCIÓN DE BOTÓN GENERAR (AHORA LLAMA AL SERVICIO) ---
  const handleGenerateClick = async () => {
    if (!startDate || !endDate) {
      alert("Selecciona ambas fechas");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Llamamos a la función externa
      await generatePDFReport(startDate, endDate, users);
      setShowReportModal(false);
    } catch (error) {
      console.error(error);
      alert("Error generando el PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-6 relative">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col gap-4">
        <div>
          <button onClick={() => setView('dashboard')} className="text-sm text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 transition-all hover:-translate-x-1">
             <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              Usuarios Registrados
              <span className="bg-slate-100 text-slate-600 text-sm py-1 px-3 rounded-full border border-slate-200">
                Total: {users.length}
              </span>
            </h2>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {role === 'admin' && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Generar Reporte</span>
              </button>
            )}

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
        </div>
      </div>

      {/* --- TABLA (Sin cambios visuales) --- */}
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
                            ${isBanned ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'}`}
                        >
                          {isBanned ? <><UserX className="w-3 h-3" /> INHABILITADO</> : <><UserCheck className="w-3 h-3" /> ACTIVO</>}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteClick(user)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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

      {/* --- MODAL DE REPORTE --- */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            
            <div className="bg-slate-50 p-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Generar Reporte</h3>
              </div>
              <p className="text-slate-500 text-sm">
                Selecciona el rango de fechas para calcular estadísticas y exportar el PDF.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Inicio</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fecha Fin</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => setShowReportModal(false)} 
                  className="flex-1 py-3 px-4 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50"
                  disabled={isGenerating}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleGenerateClick} 
                  disabled={isGenerating}
                  className="flex-1 py-3 px-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg flex justify-center items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE BLOQUEO (Sin cambios) --- */}
      {userToBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 text-center">
             <h3 className="text-xl font-bold mb-4">¿Cambiar estado?</h3>
             <div className="flex gap-3 justify-center">
               <button onClick={() => setUserToBlock(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
               <button onClick={() => executeStatusChange(userToBlock, (userToBlock.status || 'active') === 'active' ? 'disabled' : 'active')} className="px-4 py-2 bg-orange-600 text-white rounded-lg">Confirmar</button>
             </div>
           </div>
        </div>
      )}

      {/* --- MODAL DE BORRADO (Sin cambios) --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
           <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 p-6 text-center">
             <h3 className="text-xl font-bold mb-4">¿Eliminar usuario?</h3>
             <div className="flex gap-3 justify-center">
               <button onClick={() => setUserToDelete(null)} className="px-4 py-2 bg-slate-100 rounded-lg">Cancelar</button>
               <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Borrar</button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
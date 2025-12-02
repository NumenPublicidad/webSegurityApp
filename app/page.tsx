'use client';

import  { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';

import { auth, db } from '@/firebase/config';
import { 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc,
} from 'firebase/firestore';


import LoginView from '@/components/LoginView';
import AlertDetailModal from '@/components/AlertDetailModal';

import DashboardView from '@/views/DashboardView';
import UsersView from '@/views/UsersView';
import ReportsView from '@/views/ReportsView';

import { AlertData, UserRole, ViewState } from '@/types';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  
  // 1. Manejo de Sesión
  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setView('login');
    });
  }, []);

  // 2. Conexión a Firestore (Colección "alerts")
  useEffect(() => {
    if (!user) return;

    const alertsRef = collection(db, 'alerts');
    // const q = query(alertsRef, where("status", "==", "active")); // opcional

    const unsubscribe = onSnapshot(alertsRef, (snapshot) => {
      const fetchedAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AlertData[];
      
      setAlerts(fetchedAlerts);
    }, (err) => {
      console.error("Error leyendo alertas:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtramos en memoria las que sean status "active"
  const activeAlerts = useMemo(() => 
    alerts.filter(a => a.status === 'active'), 
  [alerts]);

  // Handlers
  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    // Lógica de redirección según rol
    if (selectedRole === 'monitoreo') {
      setView('reports');
    } else {
      setView('dashboard');
    }
  };

  const handleLogout = () => {
    auth.signOut();
    setRole(null);
    setView('login');
    setSelectedAlert(null);
  };

  const resolveAlert = async (alertId: string) => {
    if(!confirm("¿Estás seguro de cerrar este evento? Desaparecerá de la lista activa.")) return;
    
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        status: 'resolved', // Cambia el estado en la DB real
        resolvedAt: new Date(),
        resolvedBy: role
      });
      setSelectedAlert(null);
    } catch (error) {
      console.error("Error al cerrar evento:", error);
      alert("Error al actualizar la base de datos.");
    }
  };

  // --- RENDERIZADO ---

  if (view === 'login') {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* NAVBAR SUPERIOR */}
      <Navbar 
  role={role}
  view={view}
  setView={setView}
  handleLogout={handleLogout}
/>


      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* VISTA 1: DASHBOARD (SOLO ADMIN) */}
        {view === 'dashboard' && (
          <DashboardView setView={setView} activeAlerts={activeAlerts} />
        )}

        {/* VISTA 2: USUARIOS (PLACEHOLDER) */}
        {view === 'users' && (
          <UsersView setView={setView} />
        )}

        {/* VISTA 3: REPORTE WEB (CORE) */}
        {view === 'reports' && (
          <ReportsView activeAlerts={activeAlerts} setSelectedAlert={setSelectedAlert} />
        )}

      </main>

      {/* MODAL (OVERLAY) */}
      {selectedAlert && (
        <AlertDetailModal 
          alert={selectedAlert} 
          onClose={() => setSelectedAlert(null)} 
          onResolve={resolveAlert} 
        />
      )}
    </div>
  );
}

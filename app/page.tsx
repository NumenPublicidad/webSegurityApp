'use client';

import { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import { auth, db } from '@/firebase/config';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';

// --- VISTAS Y COMPONENTES ---
import LoginView from '@/components/LoginView';
import AlertDetailModal from '@/components/AlertDetailModal';
import DashboardView from '@/views/DashboardView';
import UsersView from '@/views/UsersView';
import ReportsView from '@/views/ReportsView';
import AnalyticsView from '@/views/AnalyticsView'; // <--- IMPORTACIÓN NUEVA

import { AlertData, UserRole, ViewState } from '@/types';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [view, setView] = useState<ViewState>('login');
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  
  // 1. Manejo de Sesión
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const dbRole = (userData.role || 'user') as UserRole;
            setRole(dbRole);
            
            // Redirección inteligente al iniciar sesión
            setView((currentView) => {
              if (currentView === 'login') {
                if (dbRole === 'admin') return 'dashboard';
                if (dbRole === 'monitoreo') return 'reports';
              }
              return currentView;
            });
          }
        } catch (error) {
          console.error("Error verificando rol:", error);
        }
      } else {
        // Logout o sin sesión
        setView('login');
        setRole(null);
        setSelectedAlert(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Conexión a Firestore (Alertas en tiempo real)
  useEffect(() => {
    if (!user) return;
    const unsubscribe = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      const fetchedAlerts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AlertData[];
      setAlerts(fetchedAlerts);
    });
    return () => unsubscribe();
  }, [user]);

  // --- FILTROS Y ORDENAMIENTO ---

  // A) Alertas ACTIVAS (Ordenadas por fecha descendente)
  const activeAlerts = useMemo(() => {
    return alerts
      .filter(a => a.status === 'active')
      .sort((a, b) => {
        const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
  }, [alerts]);

  // B) Historial (Resolved/Cancelled - Ordenados por fecha descendente)
  const historyAlerts = useMemo(() => {
    return alerts
      .filter(a => a.status === 'resolved' || a.status === 'cancelled')
      .sort((a, b) => {
        const timeA = a.timestamp instanceof Timestamp ? a.timestamp.toMillis() : 0;
        const timeB = b.timestamp instanceof Timestamp ? b.timestamp.toMillis() : 0;
        return timeB - timeA;
      });
  }, [alerts]);

  // --- HANDLERS ---
  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'monitoreo') setView('reports');
    else if (selectedRole === 'admin') setView('dashboard');
  };

  const handleLogout = () => {
    auth.signOut();
    setRole(null);
    setView('login');
    setSelectedAlert(null);
  };

  const resolveAlert = async (alertId: string) => {
    if(!confirm("¿Cerrar evento?")) return;
    try {
      await updateDoc(doc(db, 'alerts', alertId), {
        status: 'resolved', 
        resolvedAt: new Date(),
        resolvedBy: role
      });
      setSelectedAlert(null);
    } catch (error) {
      console.error(error);
    }
  };

  // --- RENDER ---

  if (view === 'login') return <LoginView onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar role={role} view={view} setView={setView} handleLogout={handleLogout} />
      
      <main className="max-w-7xl mx-auto p-6 md:p-8">
        
        {/* VISTA 1: DASHBOARD */}
        {view === 'dashboard' && (
          <DashboardView setView={setView} activeAlerts={activeAlerts} />
        )}
        
        {/* VISTA 2: USUARIOS (Necesita 'role' para mostrar botones de admin) */}
        {view === 'users' && (
          <UsersView setView={setView} role={role} />
        )}

        {/* VISTA 3: REPORTES (Necesita 'setView' para el botón volver) */}
        {view === 'reports' && (
          <ReportsView 
            activeAlerts={activeAlerts} 
            historyAlerts={historyAlerts}
            setSelectedAlert={setSelectedAlert} 
            setView={setView}
          />
        )}

        {/* VISTA 4: ESTADÍSTICAS Y PDF (NUEVA) */}
        {view === 'analytics' && (
          <AnalyticsView setView={setView} />
        )}

      </main>

      {/* MODAL GLOBAL DE DETALLES */}
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
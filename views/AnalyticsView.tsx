'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic'; 
import { 
  ArrowLeft, Search, BarChart3, PieChart, Activity, Users, AlertTriangle, MapPin, Download 
} from 'lucide-react';
import { ViewState, AlertData, AppUser } from '@/types';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { generatePDFReport } from '@/services/reportService';

// Mapa dinámico
const AnalyticsMap = dynamic(() => import('@/components/AnalyticsMap'), { 
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-2xl flex items-center justify-center text-slate-400">Cargando Mapa...</div>
});

export default function AnalyticsView({ setView }: { setView: (v: ViewState) => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AlertData[] | null>(null);
  
  // Estado extendido para incluir género
  const [stats, setStats] = useState({ 
    total: 0, 
    byType: {} as Record<string, number>, 
    usersCount: 0,
    gender: { male: 0, female: 0, other: 0 } // <--- NUEVO CAMPO
  });

  // --- LÓGICA DE ZONAS (Simulación) ---
  const calculateZones = (alerts: AlertData[]) => {
    const zones: Record<string, number> = {};
    alerts.forEach(a => {
      const lat = a.location.latitude;
      const lng = a.location.longitude;
      let zoneName = "Desconocida / Otra";

      if (lat > -34.50 && lng < -58.50) zoneName = "Tigre / Don Torcuato";
      else if (lat > -34.55 && lat <= -34.50) zoneName = "Vicente Lopez / Olivos";
      else if (lat <= -34.55 && lng > -58.45) zoneName = "CABA / Microcentro";
      else if (lng > -58.50) zoneName = "San Isidro / Martinez";

      zones[zoneName] = (zones[zoneName] || 0) + 1;
    });
    return Object.entries(zones)
      .map(([name, count]) => ({ name, count, percentage: (count / alerts.length) * 100 }))
      .sort((a, b) => b.count - a.count);
  };

  const zoneStats = useMemo(() => reportData ? calculateZones(reportData) : [], [reportData]);

  // --- BUSCADOR PRINCIPAL ---
  const handleSearch = async () => {
    if (!startDate || !endDate) return alert("Selecciona ambas fechas");
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59);

      // 1. ALERTAS
      const qAlerts = query(
        collection(db, 'alerts'),
        where("timestamp", ">=", Timestamp.fromDate(start)),
        where("timestamp", "<=", Timestamp.fromDate(end)),
        orderBy("timestamp", "desc")
      );
      const alertSnaps = await getDocs(qAlerts);
      const alerts = alertSnaps.docs.map(d => d.data() as AlertData);

      // 2. USUARIOS (Para métricas de género)
      const usersSnaps = await getDocs(collection(db, 'users'));
      const users = usersSnaps.docs.map(d => d.data() as AppUser);
      
      // 3. CÁLCULO GÉNERO
      const genderCounts = { male: 0, female: 0, other: 0 };
      users.forEach(u => {
        // Normalizamos el texto (ej: "Masculino" -> "m")
        const g = (u.gender || '').toLowerCase().trim();
        
        if (['masculino', 'hombre', 'm', 'male'].includes(g)) {
          genderCounts.male++;
        } else if (['femenino', 'mujer', 'f', 'female'].includes(g)) {
          genderCounts.female++;
        } else {
          genderCounts.other++; // Si es null o no binario
        }
      });

      // 4. CÁLCULO TIPOS
      const counts: Record<string, number> = {};
      alerts.forEach(a => { const t = (a.type || 'OTRO').toUpperCase(); counts[t] = (counts[t] || 0) + 1; });

      setStats({ 
        total: alerts.length, 
        byType: counts, 
        usersCount: users.length,
        gender: genderCounts 
      });
      
      setReportData(alerts);

    } catch (error) { console.error(error); alert("Error cargando datos"); } finally { setLoading(false); }
  };

  const handleDownload = async () => {
    const usersSnaps = await getDocs(collection(db, 'users'));
    const users = usersSnaps.docs.map(d => d.data() as AppUser);
    await generatePDFReport(startDate, endDate, users);
  };

  // Componente de Barra Simple
  const Bar = ({ label, value, total, color }: { label: string, value: number, total: number, color: string }) => {
    const pct = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between text-sm font-bold text-slate-700 mb-1">
          <span>{label}</span>
          <span>{value} ({pct.toFixed(1)}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500 space-y-8 pb-12">
      
      {/* HEADER */}
      <div>
        <button onClick={() => setView('dashboard')} className="text-sm text-slate-500 hover:text-blue-600 font-bold flex items-center gap-2 mb-4 transition-all hover:-translate-x-1">
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </button>
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
          Métricas y Estadísticas
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </h2>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end">
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="pl-4 pr-4 py-2 rounded-lg border border-slate-200 w-full" />
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="pl-4 pr-4 py-2 rounded-lg border border-slate-200 w-full" />
        </div>
        <button onClick={handleSearch} disabled={loading} className="px-6 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2">
          {loading ? 'Cargando...' : <><Search className="w-4 h-4" /> Analizar</>}
        </button>
      </div>

      {/* --- RESULTADOS VISUALES --- */}
      {reportData && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* 1. TARJETAS DE RESUMEN */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-blue-50 rounded-full text-blue-600"><AlertTriangle className="w-8 h-8" /></div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
                <div className="text-sm text-slate-500 font-medium">Alertas Totales</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-purple-50 rounded-full text-purple-600"><Users className="w-8 h-8" /></div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{stats.usersCount}</div>
                <div className="text-sm text-slate-500 font-medium">Usuarios Registrados</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-4 bg-green-50 rounded-full text-green-600"><Activity className="w-8 h-8" /></div>
              <div>
                <div className="text-3xl font-bold text-slate-900">{(stats.total / 30).toFixed(1)}</div>
                <div className="text-sm text-slate-500 font-medium">Promedio Diario (aprox)</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 2. GRÁFICOS DE BARRAS (TIPOS) */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-slate-400" /> Distribución por Tipo
              </h3>
              <Bar label="SOS / Pánico" value={stats.byType['SOS'] || 0} total={stats.total} color="bg-red-500" />
              <Bar label="Ambulancia" value={stats.byType['AMBULANCIA'] || 0} total={stats.total} color="bg-blue-500" />
              <Bar label="Incendio" value={stats.byType['INCENDIO'] || 0} total={stats.total} color="bg-orange-500" />
            </div>

            {/* 3. DEMOGRAFÍA (GÉNERO) - NUEVO */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-slate-400" /> Demografía de Usuarios
              </h3>
              
              <div className="space-y-6">
                {/* Hombres */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <Bar 
                      label="Masculino" 
                      value={stats.gender.male} 
                      total={stats.usersCount} 
                      color="bg-blue-600" 
                    />
                  </div>
                </div>

                {/* Mujeres */}
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-100 text-pink-600 rounded-full">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <Bar 
                      label="Femenino" 
                      value={stats.gender.female} 
                      total={stats.usersCount} 
                      color="bg-pink-500" 
                    />
                  </div>
                </div>

                {/* Otros */}
                {stats.gender.other > 0 && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-full">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <Bar 
                        label="Otros / No especificado" 
                        value={stats.gender.other} 
                        total={stats.usersCount} 
                        color="bg-slate-400" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 4. MAPA Y ZONAS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Mapa (Ocupa 2 columnas) */}
             <div className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-lg">
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Geolocalización</h3>
                <AnalyticsMap alerts={reportData} />
             </div>

             {/* Lista Zonas (Ocupa 1 columna) */}
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg overflow-y-auto max-h-[450px]">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" /> Zonas Calientes
                </h3>
                <div className="space-y-4">
                  {zoneStats.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? 'bg-red-500' : 'bg-slate-400'}`}>
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-700 text-sm">{zone.name}</div>
                          <div className="text-xs text-slate-400">{zone.count} Alertas</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-800">{zone.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                  {zoneStats.length === 0 && <p className="text-slate-400 text-sm text-center">Sin datos de ubicación.</p>}
                </div>
             </div>
          </div>

          {/* 5. BOTÓN DESCARGA */}
          <div className="flex justify-center pt-8 border-t border-slate-200">
             <button onClick={handleDownload} className="group relative px-8 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center gap-3">
               <Download className="w-5 h-5" /> DESCARGAR REPORTE OFICIAL (PDF)
             </button>
          </div>

        </div>
      )}
    </div>
  );
}
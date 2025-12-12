// src/services/reportService.ts
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  Timestamp,
  DocumentData // <--- 1. Importamos esto para quitar el 'any'
} from 'firebase/firestore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppUser } from '@/types'; 

export const generatePDFReport = async (
  startDateStr: string, 
  endDateStr: string, 
  currentUsers: AppUser[]
) => {
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  end.setHours(23, 59, 59);

  const alertsRef = collection(db, 'alerts');
  const qAlerts = query(
    alertsRef,
    where("timestamp", ">=", Timestamp.fromDate(start)),
    where("timestamp", "<=", Timestamp.fromDate(end)),
    orderBy("timestamp", "desc")
  );

  const querySnapshot = await getDocs(qAlerts);
  const alertsData = querySnapshot.docs.map(d => d.data());

  const totalAlerts = alertsData.length;
  const activeUsersCount = currentUsers.filter(u => u.status !== 'disabled').length;
  
  const typeCounts: Record<string, number> = {};
  
  // 2. CORRECCIÓN: Usamos DocumentData en lugar de 'any'
  alertsData.forEach((a: DocumentData) => {
    const type = (a.type || 'OTRO').toUpperCase();
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  });

  const doc = new jsPDF();

  doc.setFillColor(15, 23, 42); 
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Seguridad", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`Rango: ${startDateStr} al ${endDateStr}`, 14, 35);

  doc.setTextColor(0, 0, 0);
  let yPos = 55;

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen del Período", 14, yPos);
  
  yPos += 10;

  const drawCard = (label: string, value: string | number, x: number) => {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x, yPos, 55, 25, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + 5, yPos + 8);
    
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), x + 5, yPos + 19);
  };

  drawCard("Alertas Totales", totalAlerts, 14);
  drawCard("Usuarios Activos", activeUsersCount, 75);
  drawCard("Promedio Diario", (totalAlerts / 30).toFixed(1), 136); 

  yPos += 35;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Desglose por Tipo de Emergencia", 14, yPos);
  yPos += 5;

  const statsBody = Object.keys(typeCounts).map(type => {
    const count = typeCounts[type];
    const percentage = totalAlerts > 0 ? ((count / totalAlerts) * 100).toFixed(1) + '%' : '0%';
    return [type, count, percentage];
  });

  autoTable(doc, {
    startY: yPos,
    head: [["Tipo", "Cantidad", "% del Total"]],
    body: statsBody,
    theme: 'striped',
    headStyles: { fillColor: [15, 23, 42] },
  });

  // 3. CORRECCIÓN: Usamos @ts-expect-error en lugar de @ts-ignore
  // @ts-expect-error: lastAutoTable is a property added by the jspdf-autotable plugin
  const finalY = doc.lastAutoTable.finalY || yPos;
  
  doc.text("Base de Usuarios Registrados", 14, finalY + 15);

  const usersBody = currentUsers.map(u => [
    `${u.firstName} ${u.lastName}`,
    u.dni || '-',
    u.role.toUpperCase(),
    (u.status || 'active').toUpperCase()
  ]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Nombre", "DNI", "Rol", "Estado"]],
    body: usersBody,
    theme: 'grid',
    headStyles: { fillColor: [71, 85, 105] }, 
    styles: { fontSize: 8 }
  });

  doc.save(`Reporte_${startDateStr}_${endDateStr}.pdf`);
};
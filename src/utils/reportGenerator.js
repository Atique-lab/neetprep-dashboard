import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateRevenueReport = (data, kpi, insights) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleDateString();

  // Header
  doc.setFontSize(22);
  doc.setTextColor(139, 92, 246); // Purple
  doc.text("NEETprep Revenue Report", 14, 22);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated on: ${dateStr}`, 14, 30);
  doc.text(`Active View: ${kpi.currentMonthName || 'All Time'}`, 14, 35);

  // KPI Table
  doc.autoTable({
    startY: 45,
    head: [['Metric', 'Current Session', 'Last Session', 'Growth']],
    body: [
      ['Total Students', kpi.students, kpi.lastSessionStudents, `${kpi.enrolmentGrowth.toFixed(1)}%`],
      ['Total Revenue', `Rs ${kpi.currentSessionRev.toLocaleString()}`, `Rs ${kpi.lastSessionRev.toLocaleString()}`, `${kpi.sessionGrowth.toFixed(1)}%`],
      ['Top Performing Centre', insights.topCentre, '-', '-'],
      ['Top Manager', insights.topManager, '-', '-'],
    ],
    theme: 'striped',
    headStyles: { fillStyle: [139, 92, 246] }
  });

  // Detailed Insights
  const finalY = doc.lastAutoTable.finalY || 45;
  doc.setFontSize(14);
  doc.setTextColor(30);
  doc.text("Key Insights", 14, finalY + 15);

  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`* Performance is currently ${kpi.sessionGrowth >= 0 ? 'UP' : 'DOWN'} by ${Math.abs(kpi.sessionGrowth).toFixed(1)}% compared to the last session.`, 14, finalY + 25);
  doc.text(`* Average Revenue per Student is Rs ${Math.round(kpi.currentSessionRev / kpi.students).toLocaleString()}.`, 14, finalY + 32);
  doc.text(`* Yesterday total enrolments: ${insights.yesterdayTotal} (${insights.yesterdayExternal} External).`, 14, finalY + 39);

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount} - Confidential Data - Powered by Antigravity`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save(`Revenue_Report_${dateStr.replace(/\//g, '-')}.pdf`);
};

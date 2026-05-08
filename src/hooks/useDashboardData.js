import { useState, useEffect, useMemo } from "react";
import { useGlobalData } from "../context/DashboardContext";

/**
 * 🚀 MODERN ANALYTICS HOOK
 * Consumes structured Supabase data and generates high-level insights.
 */
export function useDashboardData() {
  const { filteredData, rawData, stats, loading, error } = useGlobalData();
  const [data, setData] = useState({
    kpi: {
      students: 0,
      currentMonthRev: 0,
      lastMonthRev: 0,
      monthlyGrowth: 0,
      currentSessionRev: 0,
      lastSessionRev: 0,
      sessionGrowth: 0,
      currentMonthName: "",
      prevMonthName: "",
      lastSessionStudents: 0,
      enrolmentGrowth: 0,
      revenueGrowthVsLastSession: 0,
    },
    insights: {
      bestDay: "-",
      bestRevenue: 0,
      worstDay: "-",
      worstRevenue: 0,
      avg: 0,
      topManager: "-",
      topCourse: "-",
      topCentre: "-",
      yesterdayExternal: 0,
      yesterdayInternal: 0,
      yesterdayTotal: 0,
      yesterdayLabel: "-",
    },
    notifications: [],
    monthlyData: [],
    dailyComparison: [],
    reconciliation: [],
  });

  useEffect(() => {
    if (loading || error || !filteredData || filteredData.length === 0) return;

    // 1. Process Time-Series Data
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentMonthName = now.toLocaleString("default", { month: "short" });
    const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("default", { month: "short" });

    const processed = filteredData;
    const currentSession = rawData.filter(d => d.session_id === 'current');
    const lastSession = rawData.filter(d => d.session_id === 'last');

    // 2. Monthly Aggregations
    const monthlyMap = {};
    processed.forEach(d => {
      const month = new Date(d.payment_date).toLocaleString("default", { month: "short" });
      monthlyMap[month] = (monthlyMap[month] || 0) + d.revenue;
    });

    const monthsOrder = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
    const monthlyData = monthsOrder
      .filter(m => monthlyMap[m] !== undefined)
      .map(m => ({
        month: m,
        revenue: monthlyMap[m] || 0,
        projectedRevenue: m === currentMonthName ? Math.round((monthlyMap[m] / now.getDate()) * new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) : null
      }));

    // 3. Daily Comparison (This Month vs Last Month)
    const dailyComparison = Array.from({ length: 31 }, (_, i) => ({
      day: (i + 1).toString(),
      currentRevenue: 0,
      lastRevenue: 0
    }));

    processed.forEach(d => {
      const dDate = new Date(d.payment_date);
      const day = dDate.getDate();
      if (dDate.getMonth() === currentMonth) {
        dailyComparison[day - 1].currentRevenue += d.revenue;
      } else if (dDate.getMonth() === (currentMonth - 1 + 12) % 12) {
        dailyComparison[day - 1].lastRevenue += d.revenue;
      }
    });

    // 4. Insights (Top Performers, etc.)
    const managerMap = {};
    const centreMap = {};
    const courseMap = {};
    let totalRev = 0;

    processed.forEach(d => {
      totalRev += d.revenue;
      if (d.manager_name) managerMap[d.manager_name] = (managerMap[d.manager_name] || 0) + d.revenue;
      if (d.centre_name) centreMap[d.centre_name] = (centreMap[d.centre_name] || 0) + d.revenue;
      if (d.course) courseMap[d.course] = (courseMap[d.course] || 0) + d.revenue;
    });

    const sortedManagers = Object.keys(managerMap).sort((a, b) => managerMap[b] - managerMap[a]);
    const sortedCentres = Object.keys(centreMap).sort((a, b) => centreMap[b] - centreMap[a]);
    
    // Yesterday Metrics
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yDayStr = yesterday.toISOString().split('T')[0];
    const yesterdayRows = currentSession.filter(d => d.payment_date === yDayStr);
    
    const yExt = yesterdayRows.filter(d => d.type?.toLowerCase().includes('external')).length;
    const yInt = yesterdayRows.filter(d => d.type?.toLowerCase().includes('internal')).length;

    // 5. Notifications & Reconciliation
    const notifs = [];
    const issues = [];
    processed.forEach((d, idx) => {
      if (d.revenue > 0 && d.centre_share === 0 && d.type?.toLowerCase().includes('external')) {
        issues.push({ id: idx, type: 'Missing Centre Share', detail: `${d.student_name} at ${d.centre_name} has ₹0 share.`, severity: 'high', date: d.payment_date });
      }
    });

    if (issues.length > 0) {
      notifs.push({ id: 'reconcile-alert', text: `Alert: ${issues.length} records need reconciliation.`, ts: new Date().toISOString() });
    }

    setData({
      kpi: {
        students: currentSession.length,
        currentMonthRev: monthlyMap[currentMonthName] || 0,
        lastMonthRev: monthlyMap[prevMonthName] || 0,
        monthlyGrowth: stats?.revenue_growth_pct || 0,
        currentSessionRev: stats?.current_rev || totalRev,
        lastSessionRev: stats?.last_rev || 0,
        sessionGrowth: stats?.revenue_growth_pct || 0,
        currentMonthName,
        prevMonthName,
        lastSessionStudents: stats?.last_students || 0,
        enrolmentGrowth: stats?.student_growth_pct || 0,
        revenueGrowthVsLastSession: stats?.revenue_growth_pct || 0,
      },
      insights: {
        bestDay: "-", // Could calculate from daily aggregation
        bestRevenue: 0,
        worstDay: "-",
        worstRevenue: 0,
        avg: totalRev / (currentSession.length || 1),
        topManager: sortedManagers[0] || "-",
        topCourse: Object.keys(courseMap).sort((a, b) => courseMap[b] - courseMap[a])[0] || "-",
        topCentre: sortedCentres[0] || "-",
        yesterdayExternal: yExt,
        yesterdayInternal: yInt,
        yesterdayTotal: yExt + yInt,
        yesterdayLabel: yDayStr,
      },
      notifications: notifs,
      monthlyData,
      dailyComparison,
      reconciliation: issues,
    });
  }, [filteredData, rawData, stats, loading, error]);

  return { ...data, loading, error };
}

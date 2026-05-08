import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { filteredData, rawData, stats, centreShares, loading, error, refreshData } = useGlobalData();
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
      avg: 0,
      topManager: "-",
      topCourse: "-",
      topCentre: "-",
      yesterdayTotal: 0,
    },
    centreMap: {},
    lastSessionComparison: {
      centreMap: {},
      managerMap: {},
      revenueBreakdown: { neetprep: 0, centre: 0, total: 0 }
    }
  });

  useEffect(() => {
    if (loading || error || !filteredData || filteredData.length === 0) return;

    const now = new Date();
    const currentMonthName = now.toLocaleString("default", { month: "short" });
    const prevMonthName = new Date(now.getFullYear(), now.getMonth() - 1, 1).toLocaleString("default", { month: "short" });

    const currentSessionRows = rawData.filter(d => d.session_id === 'current');
    const lastSessionRows = rawData.filter(d => d.session_id === 'last');

    // 1. Current Session Aggregation
    const monthlyMap = {};
    const managerMap = {};
    const centreMap = {};
    const courseMap = {};
    let totalRev = 0;

    filteredData.forEach(d => {
      totalRev += d.revenue;
      const month = new Date(d.payment_date).toLocaleString("default", { month: "short" });
      monthlyMap[month] = (monthlyMap[month] || 0) + d.revenue;
      
      if (d.manager_name) managerMap[d.manager_name] = (managerMap[d.manager_name] || 0) + d.revenue;
      if (d.centre_name) {
        if (!centreMap[d.centre_name]) centreMap[d.centre_name] = { name: d.centre_name, revenue: 0, students: 0, neetprep: 0, centre: 0 };
        centreMap[d.centre_name].revenue += d.revenue;
        centreMap[d.centre_name].students += 1;
        centreMap[d.centre_name].neetprep += d.neetprep_share;
        centreMap[d.centre_name].centre += d.centre_share;
      }
      if (d.course) courseMap[d.course] = (courseMap[d.course] || 0) + d.revenue;
    });

    // 2. Last Session Aggregation
    const lsCentreMap = {};
    const lsManagerMap = {};
    let lsNeetprep = 0, lsCentre = 0, lsTotal = 0;

    lastSessionRows.forEach(d => {
      lsTotal += d.revenue;
      lsNeetprep += d.neetprep_share;
      lsCentre += d.centre_share;

      if (d.centre_name) {
        if (!lsCentreMap[d.centre_name]) lsCentreMap[d.centre_name] = { name: d.centre_name, revenue: 0, students: 0, neetprep: 0 };
        lsCentreMap[d.centre_name].revenue += d.revenue;
        lsCentreMap[d.centre_name].students += 1;
        lsCentreMap[d.centre_name].neetprep += d.neetprep_share;
      }
      if (d.manager_name) {
        if (!lsManagerMap[d.manager_name]) lsManagerMap[d.manager_name] = { name: d.manager_name, revenue: 0, students: 0 };
        lsManagerMap[d.manager_name].revenue += d.neetprep_share;
        lsManagerMap[d.manager_name].students += 1;
      }
    });

    // Yesterday Metrics
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yDayStr = yesterday.toISOString().split('T')[0];
    const yesterdayCount = currentSessionRows.filter(d => d.payment_date === yDayStr).length;

    const sortedManagers = Object.keys(managerMap).sort((a, b) => managerMap[b] - managerMap[a]);
    const sortedCentres = Object.keys(centreMap).sort((a, b) => centreMap[b] - centreMap[a]);
    const sortedCourses = Object.keys(courseMap).sort((a, b) => courseMap[b] - courseMap[a]);

    setData({
      kpi: {
        students: currentSessionRows.length,
        currentMonthRev: monthlyMap[currentMonthName] || 0,
        lastMonthRev: monthlyMap[prevMonthName] || 0,
        monthlyGrowth: stats?.revenue_growth_pct || 0,
        currentSessionRev: stats?.current_rev || totalRev,
        lastSessionRev: stats?.last_rev || lsTotal,
        sessionGrowth: stats?.revenue_growth_pct || 0,
        currentMonthName,
        prevMonthName,
        lastSessionStudents: stats?.last_students || lastSessionRows.length,
        enrolmentGrowth: stats?.student_growth_pct || 0,
        revenueGrowthVsLastSession: stats?.revenue_growth_pct || 0,
      },
      insights: {
        avg: totalRev / (currentSessionRows.length || 1),
        topManager: sortedManagers[0] || "-",
        topCourse: sortedCourses[0] || "-",
        topCentre: sortedCentres[0] || "-",
        yesterdayTotal: yesterdayCount,
      },
      centreMap,
      lastSessionComparison: {
        centreMap: lsCentreMap,
        managerMap: lsManagerMap,
        revenueBreakdown: { neetprep: lsNeetprep, centre: lsCentre, total: lsTotal }
      }
    });
  }, [filteredData, rawData, stats, loading, error]);

  return { ...data, extraData: { newCentreShare: centreShares }, loading, error, refreshData };
}

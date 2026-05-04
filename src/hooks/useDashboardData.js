import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { filteredData, rawData, extraData, loading, error } = useGlobalData();
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
  });

  useEffect(() => {
    if (loading || error || !filteredData || filteredData.length <= 1) return;

    const parseNumber = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      return Number(val.replace(/,/g, "")) || 0;
    };

    // Helper to extract "May", "Mar", etc from "1-May - 25" or "1-May"
    const getMonth = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split("-");
      if (parts.length >= 2) {
        return parts[1].trim();
      }
      return null;
    };

    const processRows = (rows) => {
      if (!rows || rows.length <= 1) return [];
      return rows.slice(1).map((row) => ({
        date: row[1],
        revenue: parseNumber(row[11]),
        neetprep: parseNumber(row[20]),
        type: (row[12] || "").toString().trim(), // Internal/External col index 12
      })).filter(row => row.date);
    };

    const processed = processRows(filteredData);
    const lastSessionRows = extraData?.lastSession || [];
    const lastSessionProcessed = processRows(lastSessionRows);

    const monthsOrder = [
      "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"
    ];

    const totalRevenueAll = processed.reduce((sum, d) => sum + d.revenue, 0);
    const totalLastSessionRevenue = lastSessionProcessed.reduce((sum, d) => sum + d.revenue, 0);
    const lastSessionStudents = lastSessionProcessed.length;

    const monthlyMap = {};
    const lastMonthlyMap = {};

    processed.forEach((d) => {
      const month = getMonth(d.date);
      if (!month) return;
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += d.revenue;
    });

    lastSessionProcessed.forEach((d) => {
      const month = getMonth(d.date);
      if (!month) return;
      if (!lastMonthlyMap[month]) lastMonthlyMap[month] = 0;
      lastMonthlyMap[month] += d.revenue;
    });

    const monthlyData = monthsOrder
      .filter(m => monthlyMap[m] !== undefined || lastMonthlyMap[m] !== undefined)
      .map((m) => ({
        month: m,
        revenue: monthlyMap[m] || 0,
        lastRevenue: lastMonthlyMap[m] || 0,
      }));

    const currentMonthData = monthlyData[monthlyData.length - 1];
    const prevMonthData = monthlyData[monthlyData.length - 2];
    const currentMonthName = currentMonthData?.month;
    const prevMonthName = prevMonthData?.month;

    let latestDay = 0;
    processed.forEach(d => {
      if (getMonth(d.date) === currentMonthName) {
        const day = parseInt(d.date.split("-")[0], 10);
        if (day > latestDay) latestDay = day;
      }
    });

    const currentRevenue = currentMonthData?.revenue || 0;

    let mtdPrevRevenue = 0;
    processed.forEach(d => {
      if (getMonth(d.date) === prevMonthName) {
        const day = parseInt(d.date.split("-")[0], 10);
        if (day <= latestDay) {
          mtdPrevRevenue += d.revenue;
        }
      }
    });

    const prevRevenue = mtdPrevRevenue || 0;
    let sessionGrowth = 0;
    let monthlyGrowth = 0;

    if (totalLastSessionRevenue > 0) {
      sessionGrowth = ((totalRevenueAll - totalLastSessionRevenue) / totalLastSessionRevenue) * 100;
    }
    if (prevRevenue > 0) {
      monthlyGrowth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    }

    // Enrolment Growth vs Last Session
    const enrolmentGrowth = lastSessionStudents > 0
      ? (((processed.length - lastSessionStudents) / lastSessionStudents) * 100)
      : 0;

    // Revenue Growth vs Last Session (YTD equivalent — months elapsed in current session)
    // Current session starts Mar. Count how many months have data.
    const currentSessionMonths = monthsOrder.filter(m => monthlyMap[m] !== undefined);
    const lastSessionYTDRevenue = currentSessionMonths.reduce((sum, m) => sum + (lastMonthlyMap[m] || 0), 0);
    const revenueGrowthVsLastSession = lastSessionYTDRevenue > 0
      ? (((totalRevenueAll - lastSessionYTDRevenue) / lastSessionYTDRevenue) * 100)
      : 0;

    // Daily Comparison Logic (This Month vs Last Month)
    const dailyComparison = Array.from({ length: 31 }, (_, i) => ({
      day: (i + 1).toString(),
      currentRevenue: 0,
      lastRevenue: 0
    }));

    processed.forEach(d => {
      const month = getMonth(d.date);
      if (!d.date) return;
      const dayStr = d.date.split("-")[0];
      const day = parseInt(dayStr, 10);
      if (!isNaN(day) && day >= 1 && day <= 31) {
        if (month === currentMonthName) {
          dailyComparison[day - 1].currentRevenue += d.revenue;
        } else if (month === prevMonthName) {
          dailyComparison[day - 1].lastRevenue += d.revenue;
        }
      }
    });

    // Yesterday Enrolments (External / Internal / Total)
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yday = yesterday.getDate();
    const ymonth = yesterday.toLocaleString('default', { month: 'short' });
    const yyear = String(yesterday.getFullYear()).slice(-2);
    const yesterdayLabel = `${yday}-${ymonth} - ${yyear}`;

    let yesterdayExternal = 0;
    let yesterdayInternal = 0;
    const validRows = filteredData.slice(1).filter(r => r[1]);

    validRows.forEach(row => {
      if (row[1] === yesterdayLabel) {
        const type = (row[12] || "").toString().trim().toLowerCase();
        if (type === "external") yesterdayExternal++;
        else if (type === "internal") yesterdayInternal++;
      }
    });

    const yesterdayTotal = yesterdayExternal + yesterdayInternal;

    // Advanced Insights & Notifications
    const managerMap = {};
    const courseMap = {};
    const centreMap = {};
    const notifs = [];
    let zeroPaidStudents = 0;

    validRows.forEach(row => {
      const name = row[2];
      const course = row[7];
      const amount = parseNumber(row[11]);
      const centre = row[6];
      const manager = row[21];
      const centreShare = parseNumber(row[17]);

      if (amount === 0) zeroPaidStudents++;
      if (amount > 0 && centreShare === 0 && centre) {
        if (notifs.length < 20) {
          notifs.push(`Zero Centre Share for student ${name || 'Unknown'} at ${centre}`);
        }
      }

      if (manager) managerMap[manager] = (managerMap[manager] || 0) + amount;
      if (course) courseMap[course] = (courseMap[course] || 0) + amount;
      if (centre) centreMap[centre] = (centreMap[centre] || 0) + amount;
    });

    if (zeroPaidStudents > 0) {
      notifs.unshift(`Alert: ${zeroPaidStudents} Zero Paid Student(s) detected.`);
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' });
      const year = String(d.getFullYear()).slice(-2);
      return `${day}-${month} - ${year}`;
    });

    const enrolledDates = new Set(validRows.map(r => r[1]));
    const zeroEnrolmentDays = last7Days.filter(d => !enrolledDates.has(d));
    if (zeroEnrolmentDays.length > 0 && zeroEnrolmentDays.length < 7) {
      notifs.unshift(`Warning: Zero Enrolment on ${zeroEnrolmentDays.join(', ')}`);
    }

    const dayMap = {};
    processed.forEach((d) => {
      if (!d.date) return;
      if (!dayMap[d.date]) dayMap[d.date] = 0;
      dayMap[d.date] += d.neetprep;
    });

    const dayData = Object.keys(dayMap).map((date) => ({ date, revenue: dayMap[date] }));
    const sorted = [...dayData].sort((a, b) => b.revenue - a.revenue);
    const bestDay = sorted[0];
    const worstDay = sorted[sorted.length - 1];
    const total = dayData.reduce((sum, d) => sum + d.revenue, 0);
    const avg = dayData.length > 0 ? total / dayData.length : 0;

    const topManager = Object.keys(managerMap).sort((a, b) => managerMap[b] - managerMap[a])[0] || "-";
    const topCourse = Object.keys(courseMap).sort((a, b) => courseMap[b] - courseMap[a])[0] || "-";
    const topCentre = Object.keys(centreMap).sort((a, b) => centreMap[b] - centreMap[a])[0] || "-";

    setData({
      kpi: {
        students: processed.length,
        currentMonthRev: currentRevenue,
        lastMonthRev: prevRevenue,
        monthlyGrowth,
        currentSessionRev: totalRevenueAll,
        lastSessionRev: totalLastSessionRevenue,
        sessionGrowth,
        currentMonthName,
        prevMonthName,
        lastSessionStudents,
        enrolmentGrowth,
        revenueGrowthVsLastSession,
      },
      insights: {
        bestDay: bestDay?.date || "-",
        bestRevenue: bestDay?.revenue || 0,
        worstDay: worstDay?.date || "-",
        worstRevenue: worstDay?.revenue || 0,
        avg,
        topManager,
        topCourse,
        topCentre,
        yesterdayExternal,
        yesterdayInternal,
        yesterdayTotal,
        yesterdayLabel,
      },
      notifications: notifs,
      monthlyData,
      dailyComparison,
    });
  }, [filteredData, extraData, loading, error]);

  return { ...data, rawData, filteredData, extraData, loading, error };
}



import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { filteredData, rawData, extraData, loading, error } = useGlobalData();
  const [data, setData] = useState({
    kpi: {
      students: 0,
      currentRevenue: 0,
      prevRevenue: 0,
      totalRevenue: 0,
      growth: 0,
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
    },
    notifications: [],
    monthlyData: [],
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
        return parts[1].trim(); // e.g., "Mar" from "1-Mar - 26" or "1-Mar"
      }
      return null;
    };

    const processRows = (rows) => {
      if (!rows || rows.length <= 1) return [];
      return rows.slice(1).map((row) => ({
        date: row[1],
        revenue: parseNumber(row[11]),
        neetprep: parseNumber(row[20]),
      })).filter(row => row.date);
    };

    const processed = processRows(filteredData);
    const lastSessionProcessed = processRows(extraData?.lastSession || []);

    // We want the X-axis to represent the chronological flow of a session.
    // Last Session: May -> Apr. Current Session: Mar -> Apr (14 months).
    // To align them nicely, we use the standard academic months starting from March.
    const monthsOrder = [
      "Mar", "Apr", "May", "Jun", "Jul", "Aug", 
      "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"
    ];

    const totalRevenueAll = processed.reduce((sum, d) => sum + d.revenue, 0);
    const totalLastSessionRevenue = lastSessionProcessed.reduce((sum, d) => sum + d.revenue, 0);

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

    // Find current month dynamically
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

    const dayMap = {};
    processed.forEach((d) => {
      if (!d.date) return;
      if (!dayMap[d.date]) dayMap[d.date] = 0;
      dayMap[d.date] += d.neetprep;
    });

    const dayData = Object.keys(dayMap).map((date) => ({
      date,
      revenue: dayMap[date],
    }));

    const sorted = [...dayData].sort((a, b) => b.revenue - a.revenue);
    const bestDay = sorted[0];
    const worstDay = sorted[sorted.length - 1];
    const total = dayData.reduce((sum, d) => sum + d.revenue, 0);
    const avg = dayData.length > 0 ? total / dayData.length : 0;

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

    // Advanced Insights & Notifications
    const managerMap = {};
    const courseMap = {};
    const centreMap = {};
    const notifs = [];
    let zeroPaidStudents = 0;

    const validRows = filteredData.slice(1).filter(r => r[1]);
    validRows.forEach(row => {
       const date = row[1];
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

    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
       const d = new Date();
       d.setDate(today.getDate() - i);
       const day = d.getDate(); // 1, 2, ...
       const month = d.toLocaleString('default', { month: 'short' });
       const year = String(d.getFullYear()).slice(-2);
       // Format matching the CSV: "1-May - 26"
       return `${day}-${month} - ${year}`;
    });

    const enrolledDates = new Set(validRows.map(r => r[1]));
    const zeroEnrolmentDays = last7Days.filter(d => !enrolledDates.has(d));
    if (zeroEnrolmentDays.length > 0 && zeroEnrolmentDays.length < 7) {
      notifs.unshift(`Warning: Zero Enrolment on ${zeroEnrolmentDays.join(', ')}`);
    }

    const topManager = Object.keys(managerMap).sort((a,b) => managerMap[b] - managerMap[a])[0] || "-";
    const topCourse = Object.keys(courseMap).sort((a,b) => courseMap[b] - courseMap[a])[0] || "-";
    const topCentre = Object.keys(centreMap).sort((a,b) => centreMap[b] - centreMap[a])[0] || "-";

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
      },
      notifications: notifs,
      monthlyData,
      dailyComparison, // Export new Daily Comparison data
    });
  }, [filteredData, extraData, loading, error]);

  return { ...data, rawData, filteredData, extraData, loading, error };
}

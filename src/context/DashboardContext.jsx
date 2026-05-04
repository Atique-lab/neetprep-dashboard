import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchSheetData, fetchNewCentreShare, fetchLastSessionEnrolments } from '../services/sheetApi';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [rawData, setRawData] = useState([]);
  const [extraData, setExtraData] = useState({ newCentreShare: [], lastSession: [] });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("all");
  const [lastSynced, setLastSynced] = useState(null);

  const loadData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setIsRefreshing(true);
      } else {
        setLoading(true);
      }
      const [rows, newCentreShare, lastSession] = await Promise.all([
        fetchSheetData(),
        fetchNewCentreShare(),
        fetchLastSessionEnrolments()
      ]);
      setRawData(rows);
      setExtraData({ newCentreShare, lastSession });
      setLastSynced(new Date());
    } catch (err) {
      console.error("Error fetching sheet data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredData = useMemo(() => {
    if (rawData.length <= 1) return rawData;

    const userStr = localStorage.getItem('auth_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    // 1. Role-based filtering
    let roleFilteredData = rawData.slice(1);
    if (user && user.role === 'manager') {
      roleFilteredData = roleFilteredData.filter(row => {
        // Assuming "Centre Manager" is at index 22 based on the raw data log
        const managerName = row[22] ? row[22].trim() : '';
        return managerName.toLowerCase() === user.name.toLowerCase();
      });
    }

    if (dateRange === "all") return [rawData[0], ...roleFilteredData];

    const header = rawData[0];
    
    // Find the "latest" date in the dataset to act as "Today"
    let latestDate = new Date("1-Jan 2000");
    roleFilteredData.forEach(row => {
      if (row[1]) {
        const d = new Date(`${row[1]} 2026`);
        if (!isNaN(d) && d > latestDate) latestDate = d;
      }
    });

    const filtered = roleFilteredData.filter(row => {
      if (!row[1]) return false;
      const rowDate = new Date(`${row[1]} 2026`);
      if (isNaN(rowDate)) return true;

      if (dateRange === "this_month") {
        return rowDate.getMonth() === latestDate.getMonth();
      } else if (dateRange === "last_7_days") {
        const diffTime = Math.abs(latestDate - rowDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      } else if (dateRange === "last_30_days") {
        const diffTime = Math.abs(latestDate - rowDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30;
      }
      return true;
    });

    return [header, ...filtered];
  }, [rawData, dateRange]);

  const dashboardMetrics = useMemo(() => {
    const defaultData = {
      kpi: {
        students: 0, currentRevenue: 0, prevRevenue: 0, totalRevenue: 0, growth: 0,
        lastYearTotalStudents: 0, thisYearTotalRevenue: 0, lastYearTotalRevenue: 0,
        lastYearRevenueTillToday: 0, growthVsLastYearTillToday: 0,
      },
      insights: {
        bestDay: "-", bestRevenue: 0, worstDay: "-", worstRevenue: 0, avg: 0,
        topManager: "-", topCourse: "-", topCentre: "-",
      },
      notifications: [],
      monthlyData: [],
      dayWiseComparison: [],
    };

    if (loading || error || !filteredData || filteredData.length <= 1) return defaultData;

    const parseNumber = (val) => {
      if (!val) return 0;
      if (typeof val === 'number') return val;
      return Number(val.replace(/,/g, "")) || 0;
    };

    const processed = filteredData.slice(1).map((row) => ({
      date: row[1],
      revenue: parseNumber(row[11]),
      neetprep: parseNumber(row[20]),
    })).filter(row => row.date);

    const getMonth = (dateStr) => dateStr?.split("-")[1];

    const monthsOrder = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const totalRevenueAll = processed.reduce((sum, d) => sum + d.revenue, 0);

    const monthlyMap = {};
    processed.forEach((d) => {
      const month = getMonth(d.date);
      if (!month) return;
      if (!monthlyMap[month]) monthlyMap[month] = 0;
      monthlyMap[month] += d.revenue;
    });

    const monthlyData = Object.keys(monthlyMap)
      .map((m) => ({
        month: m,
        revenue: monthlyMap[m],
      }))
      .sort((a, b) => monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month));

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
    let growth = 0;
    if (prevRevenue > 0) {
      growth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
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
       let centre = row[6];
       if (centre) centre = centre.replace(/\s+/g, ' ').trim(); // Normalize centre name
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
       const day = String(d.getDate()).padStart(2, '0');
       const month = d.toLocaleString('default', { month: 'short' });
       const year = String(d.getFullYear()).slice(-2);
       return `${day}-${month}-${year}`;
    });

    const enrolledDates = new Set(validRows.map(r => r[1]));
    const zeroEnrolmentDays = last7Days.filter(d => !enrolledDates.has(d));
    if (zeroEnrolmentDays.length > 0 && zeroEnrolmentDays.length < 7) {
      notifs.unshift(`Warning: Zero Enrolment on ${zeroEnrolmentDays.join(', ')}`);
    }

    const topManager = Object.keys(managerMap).sort((a,b) => managerMap[b] - managerMap[a])[0] || "-";
    const topCourse = Object.keys(courseMap).sort((a,b) => courseMap[b] - courseMap[a])[0] || "-";
    const topCentre = Object.keys(centreMap).sort((a,b) => centreMap[b] - centreMap[a])[0] || "-";

    // --- Day Wise Comparison logic ---
    const lastSessionDayMap = {};
    let lastYearTotalStudentsSet = new Set();
    let lastYearTotalRevenue = 0;
    let lastYearRevenueTillToday = 0;

    let maxDateThisYearMs = 0;
    processed.forEach(d => {
       const ms = new Date(`${d.date} 2026`).getTime();
       if (ms > maxDateThisYearMs) {
          maxDateThisYearMs = ms;
       }
    });

    if (extraData?.lastSession?.length > 1) {
      extraData.lastSession.slice(1).forEach(row => {
        const dateStr = row[1];
        const email = row[4];
        const rev = parseNumber(row[13]); // Amount received for CTS is Column 13 in Last Session
        
        if (email) lastYearTotalStudentsSet.add(email);
        lastYearTotalRevenue += rev;
        
        if (dateStr) {
          if (!lastSessionDayMap[dateStr]) lastSessionDayMap[dateStr] = 0;
          lastSessionDayMap[dateStr] += rev;
          
          if (maxDateThisYearMs > 0) {
             const rowMs = new Date(`${dateStr} 2026`).getTime();
             if (rowMs <= maxDateThisYearMs) {
                lastYearRevenueTillToday += rev;
             }
          }
        }
      });
    }

    const lastYearTotalStudents = lastYearTotalStudentsSet.size;
    let growthVsLastYearTillToday = 0;
    if (lastYearRevenueTillToday > 0) {
       growthVsLastYearTillToday = ((totalRevenueAll - lastYearRevenueTillToday) / lastYearRevenueTillToday) * 100;
    }

    const currentDayRevMap = {};
    processed.forEach(d => {
      if (!d.date) return;
      if (!currentDayRevMap[d.date]) currentDayRevMap[d.date] = 0;
      currentDayRevMap[d.date] += d.revenue;
    });

    const allDatesSet = new Set([...Object.keys(currentDayRevMap), ...Object.keys(lastSessionDayMap)]);
    const dayWiseComparison = Array.from(allDatesSet).map(dateStr => ({
      date: dateStr,
      currentRevenue: currentDayRevMap[dateStr] || 0,
      lastSessionRevenue: lastSessionDayMap[dateStr] || 0,
    })).sort((a, b) => {
       const da = new Date(`${a.date} 2026`);
       const db = new Date(`${b.date} 2026`);
       return da - db;
    });

    return {
      kpi: {
        students: processed.length,
        currentRevenue,
        prevRevenue,
        totalRevenue: totalRevenueAll,
        growth,
        lastYearTotalStudents,
        thisYearTotalRevenue: totalRevenueAll,
        lastYearTotalRevenue,
        lastYearRevenueTillToday,
        growthVsLastYearTillToday,
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
      dayWiseComparison,
    };
  }, [filteredData, loading, error, extraData.lastSession]);

  return (
    <DashboardContext.Provider value={{
      rawData,
      filteredData,
      extraData,
      loading,
      isRefreshing,
      error,
      dateRange,
      setDateRange,
      lastSynced,
      refreshData: () => loadData(true),
      dashboardMetrics
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(DashboardContext);
}

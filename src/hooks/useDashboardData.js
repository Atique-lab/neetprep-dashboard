import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { filteredData, rawData, loading, error } = useGlobalData();
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
    },
    monthlyData: [],
  });

  useEffect(() => {
    if (loading || error || !filteredData || filteredData.length <= 1) return;

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

    setData({
      kpi: {
        students: processed.length,
        currentRevenue,
        prevRevenue,
        totalRevenue: totalRevenueAll,
        growth,
      },
      insights: {
        bestDay: bestDay?.date || "-",
        bestRevenue: bestDay?.revenue || 0,
        worstDay: worstDay?.date || "-",
        worstRevenue: worstDay?.revenue || 0,
        avg,
      },
      monthlyData,
    });
  }, [filteredData, loading, error]);

  // Keep returning rawData so components that need the master dataset still have it
  return { ...data, rawData, filteredData, loading, error };
}

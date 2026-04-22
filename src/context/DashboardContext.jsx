import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { fetchSheetData } from '../services/sheetApi';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [rawData, setRawData] = useState([]);
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
      const rows = await fetchSheetData();
      setRawData(rows);
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
    if (dateRange === "all" || rawData.length <= 1) return rawData;

    const header = rawData[0];
    
    // Find the "latest" date in the dataset to act as "Today"
    let latestDate = new Date("1-Jan 2000");
    rawData.slice(1).forEach(row => {
      if (row[1]) {
        const d = new Date(`${row[1]} 2026`);
        if (!isNaN(d) && d > latestDate) latestDate = d;
      }
    });

    const filtered = rawData.slice(1).filter(row => {
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

  return (
    <DashboardContext.Provider value={{
      rawData,
      filteredData,
      loading,
      isRefreshing,
      error,
      dateRange,
      setDateRange,
      lastSynced,
      refreshData: () => loadData(true)
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useGlobalData() {
  return useContext(DashboardContext);
}

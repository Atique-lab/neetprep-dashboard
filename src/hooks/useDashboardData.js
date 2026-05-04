import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { dashboardMetrics, rawData, filteredData, extraData, loading, error } = useGlobalData();
  
  if (!dashboardMetrics) {
    return { rawData, filteredData, extraData, loading, error };
  }
  
  return { ...dashboardMetrics, rawData, filteredData, extraData, loading, error };
}

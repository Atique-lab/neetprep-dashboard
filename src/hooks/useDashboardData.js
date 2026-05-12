import { useGlobalData } from "../context/DashboardContext";

export function useDashboardData() {
  const { filteredData, rawData, extraData, loading, error, dashboardComputedData } = useGlobalData();

  // If dashboardComputedData is undefined (e.g. initial render before memo), provide fallback
  const computed = dashboardComputedData || {
    kpi: { students: 0, currentMonthRev: 0, lastMonthRev: 0, monthlyGrowth: 0, currentSessionRev: 0, lastSessionRev: 0, sessionGrowth: 0, currentMonthName: "", prevMonthName: "", lastSessionStudents: 0, enrolmentGrowth: 0, revenueGrowthVsLastSession: 0 },
    insights: { bestDay: "-", bestRevenue: 0, worstDay: "-", worstRevenue: 0, avg: 0, topManager: "-", topCourse: "-", topCentre: "-", yesterdayExternal: 0, yesterdayInternal: 0, yesterdayTotal: 0, yesterdayLabel: "-", yesterdayExtPaidNeetprep: 0, yesterdayExtPaidCentre: 0 },
    notifications: [], monthlyData: [], dailyComparison: [], reconciliation: [], deduplicatedData: [],
    lastSessionComparison: { managerMap: {}, centreMap: {}, revenueBreakdown: { neetprep: 0, centre: 0, gst: 0, total: 0 }, paymentMethods: {}, emailSet: new Set(), monthlyByManager: {}, monthlyByCentre: {} }
  };

  return {
    ...computed,
    filteredData,
    rawData,
    extraData,
    loading,
    error
  };
}

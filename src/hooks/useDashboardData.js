import { useState, useEffect } from "react";
import { useGlobalData } from "../context/DashboardContext";

// Normalize Razorpay variants into a single label
const normalizePaymentMethod = (method) => {
  if (!method) return "Unknown";
  const m = method.trim().toLowerCase();
  if (m.includes("razorpay") || m.includes("razor pay")) return "Razorpay";
  return method.trim();
};

// Format raw DB payment method names into human-readable labels
const formatMethod = (m) => {
  if (m === "Razorpay") return "Razorpay";
  const map = {
    cash_centre: "Cash at Centre",
    online_centre: "Online via Centre",
    "Online Through NEETprep Link": "NEETprep Link",
    "Paid in NEETprep A/c": "Bank Transfer",
  };
  return map[m] || m.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
};

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
    // Session comparison data for all pages
    lastSessionComparison: {
      managerMap: {},
      centreMap: {},
      revenueBreakdown: { neetprep: 0, centre: 0, gst: 0, total: 0 },
      paymentMethods: {},
      emailSet: new Set(),
      monthlyByManager: {},
      monthlyByCentre: {},
    },
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
      return rows.slice(1).map((row) => {
        const rawMethod = (row[8] || "").toString().trim();
        const normalizedMethod = (rawMethod.toLowerCase().includes("razorpay") || rawMethod.toLowerCase().includes("razor pay")) 
          ? "Razorpay" 
          : rawMethod;

        return {
          date: row[1],
          email: (row[4] || "").toString().trim().toLowerCase(),
          centre: (row[6] || "").toString().trim(),
          course: (row[7] || "").toString().trim(),
          paymentMethod: normalizedMethod,
          revenue: parseNumber(row[11]),
          intExt: (row[12] || "").toString().trim(),
          paymentTo: (row[13] || "").toString().trim(),
          gst: parseNumber(row[14]),
          courier: parseNumber(row[15]),
          printingCost: parseNumber(row[16]),
          centreShare: parseNumber(row[17]),
          neetprep: parseNumber(row[20]),
          manager: (row[21] || "").toString().trim(),
          type: (row[12] || "").toString().trim(),
        };
      }).filter(row => row.date);
    };

    const processed = processRows(filteredData);
    const lastSessionRows = extraData?.lastSession || [];
    const lastSessionProcessed = processRows(lastSessionRows);

    // Deduplicate last session by email: unique student count + deduplicated revenue (col L)
    const lastSessionEmailMap = {};
    lastSessionProcessed.forEach(d => {
      const key = d.email || `__no_email_${Math.random()}`;
      if (!lastSessionEmailMap[key]) {
        lastSessionEmailMap[key] = d.revenue; // first entry per email
      }
    });
    const lastSessionStudents = Object.keys(lastSessionEmailMap).length;
    const totalLastSessionRevenue = Object.values(lastSessionEmailMap).reduce((s, v) => s + v, 0);

    // ═══════════════════════════════════════════
    // BUILD LAST SESSION COMPARISON DATA
    // ═══════════════════════════════════════════

    // Last Session — Email Set for "Returning" detection
    const lastSessionEmailSet = new Set(
      lastSessionProcessed.map(d => d.email).filter(Boolean)
    );

    // Last Session — Manager Map
    const lsManagerMap = {};
    const lsMonthlyByManager = {};
    lastSessionProcessed.forEach(d => {
      const mgr = d.manager || "Unassigned";
      if (mgr === "Unassigned" || !mgr) return;
      if (!lsManagerMap[mgr]) lsManagerMap[mgr] = { revenue: 0, students: 0, centresSet: new Set() };
      lsManagerMap[mgr].revenue += d.neetprep;
      lsManagerMap[mgr].students += 1;
      lsManagerMap[mgr].centresSet.add(d.centre);

      const month = getMonth(d.date);
      if (month) {
        if (!lsMonthlyByManager[mgr]) lsMonthlyByManager[mgr] = {};
        lsMonthlyByManager[mgr][month] = (lsMonthlyByManager[mgr][month] || 0) + d.neetprep;
      }
    });

    // Last Session — Centre Map
    const lsCentreMap = {};
    const lsMonthlyByCentre = {};
    lastSessionProcessed.forEach(d => {
      const ctr = d.centre || "Unknown";
      if (ctr === "Unknown") return;
      if (!lsCentreMap[ctr]) lsCentreMap[ctr] = { revenue: 0, students: 0, internal: 0, external: 0, neetprep: 0, centreShare: 0, printingCost: 0 };
      lsCentreMap[ctr].revenue += d.revenue;
      lsCentreMap[ctr].students += 1;
      lsCentreMap[ctr].neetprep += d.neetprep;
      lsCentreMap[ctr].centreShare += d.centreShare;
      lsCentreMap[ctr].printingCost += d.printingCost;
      if (d.intExt.toLowerCase().includes("internal")) lsCentreMap[ctr].internal += 1;
      else if (d.intExt.toLowerCase().includes("external")) lsCentreMap[ctr].external += 1;

      const month = getMonth(d.date);
      if (month) {
        if (!lsMonthlyByCentre[ctr]) lsMonthlyByCentre[ctr] = {};
        lsMonthlyByCentre[ctr][month] = (lsMonthlyByCentre[ctr][month] || 0) + d.revenue;
      }
    });

    // Last Session — Revenue Breakdown
    let lsNeetprep = 0, lsCentre = 0, lsGst = 0;
    lastSessionProcessed.forEach(d => {
      lsNeetprep += d.neetprep;
      lsCentre += d.centreShare;
      lsGst += d.gst;
    });

    // Last Session — Payment Methods (with Razorpay normalization)
    const lsPaymentMethodMap = {};
    lastSessionProcessed.forEach(d => {
      const normalized = normalizePaymentMethod(d.paymentMethod);
      const label = formatMethod(normalized);
      lsPaymentMethodMap[label] = (lsPaymentMethodMap[label] || 0) + d.revenue;
    });

    const lastSessionComparison = {
      managerMap: lsManagerMap,
      centreMap: lsCentreMap,
      revenueBreakdown: { neetprep: lsNeetprep, centre: lsCentre, gst: lsGst, total: lsNeetprep + lsCentre },
      paymentMethods: lsPaymentMethodMap,
      emailSet: lastSessionEmailSet,
      monthlyByManager: lsMonthlyByManager,
      monthlyByCentre: lsMonthlyByCentre,
    };

    // ═══════════════════════════════════════════
    // CURRENT SESSION PROCESSING (existing)
    // ═══════════════════════════════════════════

    const monthsOrder = [
      "Mar", "Apr", "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"
    ];

    const totalRevenueAll = processed.reduce((sum, d) => sum + d.revenue, 0);

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

    // ── Use REAL calendar month from today's date ──────────────────────────
    const now = new Date();
    const currentMonthName = now.toLocaleString("default", { month: "short" });
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthName = prevDate.toLocaleString("default", { month: "short" });
    const todayDay = now.getDate();

    const currentRevenue = monthlyMap[currentMonthName] || 0;
    const lastMonthRevFull = monthlyMap[prevMonthName] || 0;

    let mtdPrevRevenue = 0;
    processed.forEach(d => {
      if (getMonth(d.date) === prevMonthName) {
        const day = parseInt(d.date.split("-")[0], 10);
        if (day <= todayDay) {
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

    // Deduplicate current session by email for fair enrolment growth comparison
    const currentUniqueEmails = new Set(processed.map(d => d.email).filter(Boolean));
    const currentUniqueCount = currentUniqueEmails.size || processed.length;
    const enrolmentGrowth = lastSessionStudents > 0
      ? (((currentUniqueCount - lastSessionStudents) / lastSessionStudents) * 100)
      : 0;

    // Revenue growth uses only months that exist in current session (fair YTD comparison)
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

    // Helper to normalize payment methods
    const normalizePayment = (method) => {
      if (!method) return "Unknown";
      const m = method.toLowerCase();
      if (m.includes("razorpay") || m.includes("razor pay")) return "Razorpay";
      return method;
    };

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
      if ((row[1] || "").toString().trim() === yesterdayLabel.trim()) {
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
    const notifTimestamp = new Date().toISOString();
    let zeroPaidStudents = 0;

    validRows.forEach(row => {
      const name = row[2];
      const course = row[7];
      const amount = parseNumber(row[11]);
      const centre = row[6];
      const manager = row[21];
      const centreShareVal = parseNumber(row[17]);

      if (amount === 0) zeroPaidStudents++;
      if (amount > 0 && centreShareVal === 0 && centre) {
        if (notifs.length < 20) {
          notifs.push({ text: `Zero Centre Share for student ${name || 'Unknown'} at ${centre}`, ts: notifTimestamp });
        }
      }

      if (manager) managerMap[manager] = (managerMap[manager] || 0) + amount;
      if (course) courseMap[course] = (courseMap[course] || 0) + amount;
      if (centre) centreMap[centre] = (centreMap[centre] || 0) + amount;
    });

    if (zeroPaidStudents > 0) {
      notifs.unshift({ text: `Alert: ${zeroPaidStudents} Zero Paid Student(s) detected.`, ts: notifTimestamp });
    }

    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const day = d.getDate();
      const month = d.toLocaleString('default', { month: 'short' });
      const year = String(d.getFullYear()).slice(-2);
      return `${day}-${month} - ${year}`;
    });

    const enrolledDates = new Set(validRows.map(r => (r[1] || "").toString().trim()));
    const zeroEnrolmentDays = last7Days.filter(d => !enrolledDates.has(d));
    if (zeroEnrolmentDays.length > 0 && zeroEnrolmentDays.length < 7) {
      notifs.unshift({ text: `Warning: Zero Enrolment on ${zeroEnrolmentDays.join(', ')}`, ts: notifTimestamp });
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
        lastMonthRev: lastMonthRevFull,
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
      lastSessionComparison,
    });
  }, [filteredData, extraData, loading, error]);

  return { ...data, rawData, filteredData, extraData, loading, error };
}

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
      yesterdayExtPaidNeetprep: 0,
      yesterdayExtPaidCentre: 0,
    },
    notifications: [],
    monthlyData: [],
    dailyComparison: [],
    reconciliation: [],
    deduplicatedData: [],
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

    const processRowsDeduplicated = (rows) => {
      if (!rows || rows.length <= 1) return [];
      
      const studentMap = new Map();
      
      rows.slice(1).forEach((row, idx) => {
        if (!row[1]) return; // Skip empty dates
        
        const email = (row[4] || "").toString().trim().toLowerCase();
        const mobile = (row[3] || "").toString().trim();
        const admNo = (row[0] || "").toString().trim();
        const name = (row[2] || "").toString().trim().toLowerCase();
        
        // Priority: email > admNo > mobile > name > fallback
        const key = email || admNo || mobile || name || `unknown-${idx}`;
        
        const intExtRaw = (row[12] || "").toString().trim();
        const isInternalRow = intExtRaw.toLowerCase().includes("internal");
        
        if (!studentMap.has(key)) {
          studentMap.set(key, {
            date: row[1],
            email, mobile, admNo, name, key,
            revenue: 0,
            centreShare: 0,
            neetprep: 0,
            gst: 0,
            intExt: intExtRaw,
            isInternal: isInternalRow,
            manager: (row[21] || "").toString().trim(),
            centre: (row[6] || "").toString().trim(),
            course: (row[7] || "").toString().trim(),
            type: intExtRaw.toLowerCase()
          });
        }
        
        const student = studentMap.get(key);
        student.revenue += parseNumber(row[11]);
        student.centreShare += parseNumber(row[17]);
        student.neetprep += parseNumber(row[20]);
        student.gst += parseNumber(row[14]);
        
        // APPLY BUSINESS RULE #2: INTERNAL > EXTERNAL
        if (isInternalRow && !student.isInternal) {
          student.isInternal = true;
          student.intExt = "Internal";
          student.type = "internal";
          student.manager = (row[21] || "").toString().trim() || student.manager;
          student.centre = (row[6] || "").toString().trim() || student.centre;
        }
      });
      
      return Array.from(studentMap.values());
    };

    const getAbsoluteDate = (str) => {
      if (!str) return null;
      const parts = str.split("-");
      if (parts.length < 2) return null;
      const day = parseInt(parts[0].trim());
      const monthStr = parts[1].trim();
      const yearStr = parts[2] ? `20${parts[2].trim()}` : new Date().getFullYear();
      const parsed = new Date(`${monthStr} ${day}, ${yearStr}`);
      return isNaN(parsed.getTime()) ? null : parsed;
    };

    const getValidStart = (dates) => {
      if (!dates || dates.length === 0) return null;
      const sorted = [...dates].sort((a, b) => a - b);
      // Remove extreme outliers (like 1999) by checking against median
      const median = sorted[Math.floor(sorted.length / 2)];
      const oneYearBefore = new Date(median);
      oneYearBefore.setFullYear(median.getFullYear() - 1);
      return sorted.find(d => d >= oneYearBefore) || sorted[0];
    };

    const processed = processRows(filteredData);
    const deduplicatedData = processRowsDeduplicated(filteredData);
    const processedFullCurrent = processRows(rawData);
    
    const lastSessionRows = extraData?.lastSession || [];
    const lastSessionProcessedFull = processRows(lastSessionRows);
    const lastSessionProcessedFullDeduplicated = processRowsDeduplicated(lastSessionRows);

    // Filter Last Session data "Till Today" relative to session start
    // We use rawData (unfiltered) to find the TRUE start of the current session
    const currentSessionDates = processedFullCurrent.map(d => getAbsoluteDate(d.date)).filter(Boolean);
    const currentSessionStart = getValidStart(currentSessionDates) || new Date();
    
    const todayObj = new Date();
    const oneYearAgo = new Date(todayObj);
    oneYearAgo.setFullYear(todayObj.getFullYear() - 1);

    const lastSessionDates = lastSessionProcessedFull.map(d => getAbsoluteDate(d.date)).filter(Boolean);
    const lastSessionStart = getValidStart(lastSessionDates);

    const lastSessionProcessed = lastSessionProcessedFull.filter(d => {
      const dDate = getAbsoluteDate(d.date);
      if (!dDate || !lastSessionStart) return true;
      // Filter exactly up to this calendar day last year
      return dDate >= lastSessionStart && dDate <= oneYearAgo;
    });

    const lastSessionProcessedDeduplicated = lastSessionProcessedFullDeduplicated.filter(d => {
      const dDate = getAbsoluteDate(d.date);
      if (!dDate || !lastSessionStart) return true;
      return dDate >= lastSessionStart && dDate <= oneYearAgo;
    });

    // TOTAL Last Session (Full Benchmark)
    const lastSessionStudentsTotal = lastSessionProcessedFullDeduplicated.length;
    const lastSessionRevenueTotal = lastSessionProcessedFull.reduce((s, v) => s + v.revenue, 0);

    // TILL TODAY Last Session (Relative Comparison)
    const lastSessionStudentsTillToday = lastSessionProcessedDeduplicated.length;
    const lastSessionRevenueTillToday = lastSessionProcessed.reduce((s, v) => s + v.revenue, 0);

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
    
    // Revenue logic uses ALL transactions
    lastSessionProcessed.forEach(d => {
      const mgr = d.manager || "Unassigned";
      if (mgr === "Unassigned" || !mgr) return;
      if (!lsManagerMap[mgr]) lsManagerMap[mgr] = { revenue: 0, students: 0, centresSet: new Set() };
      lsManagerMap[mgr].revenue += d.neetprep;
      lsManagerMap[mgr].centresSet.add(d.centre);

      const month = getMonth(d.date);
      if (month) {
        if (!lsMonthlyByManager[mgr]) lsMonthlyByManager[mgr] = {};
        lsMonthlyByManager[mgr][month] = (lsMonthlyByManager[mgr][month] || 0) + d.neetprep;
      }
    });
    
    // Student logic uses DEDUPLICATED data
    lastSessionProcessedDeduplicated.forEach(d => {
      const mgr = d.manager || "Unassigned";
      if (mgr === "Unassigned" || !mgr) return;
      if (!lsManagerMap[mgr]) lsManagerMap[mgr] = { revenue: 0, students: 0, centresSet: new Set() };
      lsManagerMap[mgr].students += 1;
    });

    // Last Session — Centre Map
    const lsCentreMap = {};
    const lsMonthlyByCentre = {};
    
    // Revenue logic uses ALL transactions
    lastSessionProcessed.forEach(d => {
      const ctr = d.centre || "Unknown";
      if (ctr === "Unknown") return;
      if (!lsCentreMap[ctr]) lsCentreMap[ctr] = { revenue: 0, students: 0, internal: 0, external: 0, neetprep: 0, centreShare: 0, printingCost: 0 };
      lsCentreMap[ctr].revenue += d.revenue;
      lsCentreMap[ctr].neetprep += d.neetprep;
      lsCentreMap[ctr].centreShare += d.centreShare;
      lsCentreMap[ctr].printingCost += d.printingCost;

      const month = getMonth(d.date);
      if (month) {
        if (!lsMonthlyByCentre[ctr]) lsMonthlyByCentre[ctr] = {};
        lsMonthlyByCentre[ctr][month] = (lsMonthlyByCentre[ctr][month] || 0) + d.revenue;
      }
    });

    // Student logic uses DEDUPLICATED data
    lastSessionProcessedDeduplicated.forEach(d => {
      const ctr = d.centre || "Unknown";
      if (ctr === "Unknown") return;
      if (!lsCentreMap[ctr]) lsCentreMap[ctr] = { revenue: 0, students: 0, internal: 0, external: 0, neetprep: 0, centreShare: 0, printingCost: 0 };
      lsCentreMap[ctr].students += 1;
      if (d.type.includes("internal")) lsCentreMap[ctr].internal += 1;
      else if (d.type.includes("external")) lsCentreMap[ctr].external += 1;
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

    lastSessionProcessedFull.forEach((d) => {
      const dateObj = getAbsoluteDate(d.date);
      if (!dateObj) return;

      const year = dateObj.getFullYear();
      const mIdx = dateObj.getMonth();
      if (year >= 2026 && mIdx >= 2) return; // Exclude Mar 2026 onwards

      const month = dateObj.toLocaleString("default", { month: "short" });
      if (!lastMonthlyMap[month]) lastMonthlyMap[month] = 0;
      lastMonthlyMap[month] += d.revenue;
    });

    const monthlyData = monthsOrder
      .filter(m => monthlyMap[m] !== undefined || lastMonthlyMap[m] !== undefined)
      .map((m) => {
        const item = {
          month: m,
          revenue: monthlyMap[m] || 0,
          lastRevenue: lastMonthlyMap[m] || 0,
        };

        // Add projection for the current month
        const now = new Date();
        const currentMonthName = now.toLocaleString("default", { month: "short" });
        if (m === currentMonthName) {
          const dayOfMonth = now.getDate();
          const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
          item.projectedRevenue = Math.round((item.revenue / dayOfMonth) * daysInMonth);
        }
        
        return item;
      });

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

    if (lastSessionRevenueTillToday > 0) {
      sessionGrowth = ((totalRevenueAll - lastSessionRevenueTillToday) / lastSessionRevenueTillToday) * 100;
    }
    if (prevRevenue > 0) {
      monthlyGrowth = ((currentRevenue - prevRevenue) / prevRevenue) * 100;
    }

    // Deduplicate current session by email (with fallback) for fair enrolment growth comparison
    const currentUniqueCount = deduplicatedData.length;
    const enrolmentGrowth = lastSessionStudentsTillToday > 0
      ? (((currentUniqueCount - lastSessionStudentsTillToday) / lastSessionStudentsTillToday) * 100)
      : 0;

    const revenueGrowthVsLastSession = lastSessionRevenueTillToday > 0
      ? (((totalRevenueAll - lastSessionRevenueTillToday) / lastSessionRevenueTillToday) * 100)
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
    
    // We use deduplicated data for accurate daily unique student counting
    deduplicatedData.forEach(student => {
      if ((student.date || "").toString().trim() === yesterdayLabel.trim()) {
        if (student.type === "external") yesterdayExternal++;
        else if (student.type === "internal") yesterdayInternal++;
      }
    });
    
    // Extra insight: how many external payments were made to NEETprep vs Centre yesterday
    // This MUST use transactions, not deduplicated students
    let yesterdayExtPaidNeetprep = 0;
    let yesterdayExtPaidCentre = 0;
    const validRows = filteredData.slice(1).filter(r => r[1]);
    validRows.forEach(row => {
      if ((row[1] || "").toString().trim() === yesterdayLabel.trim()) {
        const type = (row[12] || "").toString().trim().toLowerCase();
        const paidTo = (row[13] || "").toString().trim().toLowerCase();
        
        if (type === "external") {
          if (paidTo.includes("neetprep")) yesterdayExtPaidNeetprep++;
          else if (paidTo.includes("centre") || paidTo.includes("center")) yesterdayExtPaidCentre++;
        }
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

    validRows.forEach((row, idx) => {
      const name = row[2];
      const course = row[7];
      const amount = parseNumber(row[11]);
      const centre = row[6];
      const manager = row[21];
      const centreShareVal = parseNumber(row[17]);

      if (amount === 0) zeroPaidStudents++;
      if (amount > 0 && centreShareVal === 0 && centre) {
        if (notifs.length < 20) {
          notifs.push({ id: `share-0-${idx}`, text: `Zero Centre Share for student ${name || 'Unknown'} at ${centre}`, ts: notifTimestamp });
        }
      }

      if (manager) managerMap[manager] = (managerMap[manager] || 0) + amount;
      if (course) courseMap[course] = (courseMap[course] || 0) + amount;
      if (centre) centreMap[centre] = (centreMap[centre] || 0) + amount;
    });

    if (zeroPaidStudents > 0) {
      notifs.unshift({ id: `zero-paid-${zeroPaidStudents}`, text: `Alert: ${zeroPaidStudents} Zero Paid Student(s) detected.`, ts: notifTimestamp });
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
      notifs.unshift({ id: `zero-${zeroEnrolmentDays.join('-')}`, text: `Warning: Zero Enrolment on ${zeroEnrolmentDays.join(', ')}`, ts: notifTimestamp });
    }

    // Bulk & Trial Alerts
    const centreDailyCount = {};
    const trialStudents = [];
    processed.forEach(d => {
      if (d.revenue === 0) trialStudents.push(d);
      const key = `${d.date}_${d.centre}`;
      centreDailyCount[key] = (centreDailyCount[key] || 0) + 1;
    });

    Object.keys(centreDailyCount).forEach(key => {
      if (centreDailyCount[key] >= 10) {
        const [date, centre] = key.split('_');
        notifs.unshift({ id: `bulk-${key}`, text: `Bulk Enrolment: ${centreDailyCount[key]} students joined at ${centre} on ${date}`, ts: notifTimestamp });
      }
    });

    if (trialStudents.length > 0) {
      const latestTrial = trialStudents[0];
      notifs.unshift({ id: `trial-${trialStudents.length}`, text: `Trial Access: ${trialStudents.length} students currently on Trial Access (₹0 Paid).`, ts: notifTimestamp });
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
        students: deduplicatedData.length,
        currentMonthRev: currentRevenue,
        lastMonthRev: lastMonthRevFull,
        monthlyGrowth,
        currentSessionRev: totalRevenueAll,
        lastSessionRev: lastSessionRevenueTotal,
        sessionGrowth,
        currentMonthName,
        prevMonthName,
        lastSessionStudents: lastSessionStudentsTotal,
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
        yesterdayExtPaidNeetprep,
        yesterdayExtPaidCentre,
      },
      notifications: notifs,
      monthlyData,
      dailyComparison,
      lastSessionComparison,
      reconciliation: (() => {
        const issues = [];
        processed.forEach((d, idx) => {
          // Rule 1: Paid student but zero centre share (for external students)
          if (d.revenue > 0 && d.centreShare === 0 && d.type.toLowerCase().includes("external") && !d.paymentTo.toLowerCase().includes("neetprep")) {
            issues.push({ id: idx, type: 'Missing Centre Share', detail: `Student at ${d.centre} has ₹${d.revenue} revenue but ₹0 share.`, severity: 'high', date: d.date });
          }
          // Rule 2: Missing GST for online payments
          if (d.revenue > 0 && d.gst === 0 && d.paymentMethod.toLowerCase().includes("online")) {
            issues.push({ id: idx, type: 'GST Missing', detail: `Online payment from ${d.centre} is missing GST record.`, severity: 'medium', date: d.date });
          }
          // Rule 3: Neetprep share is 0 for non-centre payments
          if (d.revenue > 0 && d.neetprep === 0 && d.paymentTo.toLowerCase().includes("neetprep")) {
            issues.push({ id: idx, type: 'NEETprep Share Error', detail: `Payment directed to NEETprep but recorded share is ₹0.`, severity: 'high', date: d.date });
          }
        });
        return issues;
      })(),
      deduplicatedData,
    });
  }, [filteredData, extraData, loading, error]);

  return { ...data, rawData, filteredData, extraData, loading, error };
}

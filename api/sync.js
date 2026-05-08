import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Papa from 'papaparse';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SHEET_URLS = {
  current: "https://docs.google.com/spreadsheets/d/1DZdiG1uVRUz2W9EtJdhkW7RBwniJhaSSivtJtnihTWU/export?format=csv&gid=0",
  last: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4cMEDg9HDTf1W786dR8KGQto8XJxUqvqt0Ii5bIyCeiCZm7p6XtbjS_rGiZ46tQwZ2SK4d6uO2bvj/pub?gid=739726484&single=true&output=csv",
  shares: "https://docs.google.com/spreadsheets/d/1DZdiG1uVRUz2W9EtJdhkW7RBwniJhaSSivtJtnihTWU/export?format=csv&gid=137526139"
};

const parseNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, "").replace('%', '')) || 0;
};

export default async function handler(req, res) {
  try {
    // 1. Sync Centre Shares First
    console.log("Syncing Centre Shares...");
    const shareRes = await axios.get(SHEET_URLS.shares);
    const parsedShares = Papa.parse(shareRes.data, { header: false, skipEmptyLines: true }).data.slice(1);
    
    const transformedShares = parsedShares.map(row => ({
      centre_name: (row[0] || "").toString().trim(),
      ext_centre_share_pct: parseNumber(row[1]),
      int_centre_share_pct: parseNumber(row[2]),
      manager_name: (row[4] || "").toString().trim(),
      ext_neetprep_share_pct: parseNumber(row[5]),
      int_neetprep_share_pct: parseNumber(row[6]),
      updated_at: new Date().toISOString()
    })).filter(s => s.centre_name);

    await supabase.from('centre_shares').upsert(transformedShares, { onConflict: 'centre_name' });

    // 2. Sync Payments (Main Data)
    let totalProcessed = 0;
    for (const sessionId of ['current', 'last']) {
      console.log(`Syncing ${sessionId} data...`);
      const response = await axios.get(SHEET_URLS[sessionId]);
      const rows = Papa.parse(response.data, { header: false, skipEmptyLines: true }).data.slice(1);

      const transformedRows = rows.map((row) => {
        const studentName = (row[2] || "").toString().trim();
        const phone = (row[3] || "").toString().trim(); // Column D
        const date = (row[1] || "").toString().trim(); // Column B
        const amount = parseNumber(row[11]); // Column L
        const centre = (row[6] || "").toString().trim(); // Column G
        const course = (row[7] || "").toString().trim(); // Column H
        
        // Deterministic ID
        const externalId = `${studentName}_${date}_${amount}_${centre}_${course}_${sessionId}`.replace(/\s+/g, '_').toLowerCase();

        return {
          external_id: externalId,
          payment_date: formatDate(date),
          student_name: studentName,
          phone: phone,
          email: (row[4] || "").toString().trim().toLowerCase(),
          centre_name: centre,
          course: course,
          payment_method: (row[8] || "").toString().trim(),
          revenue: amount,
          type: (row[12] || "").toString().trim(),
          paid_to: (row[13] || "").toString().trim(),
          gst: parseNumber(row[14]),
          courier_cost: parseNumber(row[15]),
          printing_cost: parseNumber(row[16]),
          centre_share: parseNumber(row[17]),
          neetprep_share: parseNumber(row[20]),
          manager_name: (row[21] || "").toString().trim(),
          session_id: sessionId,
          last_synced_at: new Date().toISOString()
        };
      }).filter(r => r.payment_date && r.revenue > 0);

      // Deduplicate batch
      const uniqueRows = Array.from(
        transformedRows.reduce((map, row) => {
          map.set(row.external_id, row);
          return map;
        }, new Map()).values()
      );

      for (let i = 0; i < uniqueRows.length; i += 500) {
        const { error } = await supabase.from('payments').upsert(uniqueRows.slice(i, i + 500), { onConflict: 'external_id' });
        if (error) throw error;
      }
      totalProcessed += uniqueRows.length;
    }

    return res.status(200).json({ success: true, processed: totalProcessed });

  } catch (error) {
    console.error("Sync Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split("-");
    if (parts.length < 2) return null;
    const day = parts[0].trim();
    const monthStr = parts[1].trim();
    const yearPart = parts[2] ? parts[2].trim() : "26";
    const monthMap = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
    const month = monthMap[monthStr] || '01';
    const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
    return `${year}-${month}-${day.padStart(2, '0')}`;
  } catch (e) { return null; }
}

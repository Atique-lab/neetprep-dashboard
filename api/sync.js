import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import Papa from 'papaparse';

// Initialize Supabase with Service Role Key (Required for bypassing RLS during sync)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SHEET_URLS = {
  current: "https://docs.google.com/spreadsheets/d/1DZdiG1uVRUz2W9EtJdhkW7RBwniJhaSSivtJtnihTWU/export?format=csv&gid=0",
  last: "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4cMEDg9HDTf1W786dR8KGQto8XJxUqvqt0Ii5bIyCeiCZm7p6XtbjS_rGiZ46tQwZ2SK4d6uO2bvj/pub?gid=739726484&single=true&output=csv"
};

const parseNumber = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  return parseFloat(val.toString().replace(/,/g, "")) || 0;
};

export default async function handler(req, res) {
  // 1. Security Check (Vercel Cron protection)
  // if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return res.status(401).json({ error: 'Unauthorized' });
  // }

  const startTime = new Date();
  let totalAdded = 0;
  let totalUpdated = 0;

  try {
    for (const [sessionId, url] of Object.entries(SHEET_URLS)) {
      console.log(`Starting sync for session: ${sessionId}...`);
      
      const response = await axios.get(url);
      const csvData = response.data;

      const parsed = Papa.parse(csvData, { header: false, skipEmptyLines: true });
      const rows = parsed.data.slice(1); // Skip header

      const transformedRows = rows.map((row) => {
        const studentName = (row[2] || "").toString().trim();
        const date = (row[1] || "").toString().trim();
        const amount = parseNumber(row[11]);
        const centre = (row[6] || "").toString().trim();
        const course = (row[7] || "").toString().trim();
        
        // Generate unique deterministic ID to prevent duplicates
        const externalId = `${studentName}_${date}_${amount}_${centre}_${course}_${sessionId}`.replace(/\s+/g, '_').toLowerCase();

        return {
          external_id: externalId,
          payment_date: formatDate(date),
          student_name: studentName,
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

      // --- DEDUPLICATION LOGIC ---
      // PostgreSQL doesn't allow multiple upserts on the same key in one batch.
      // We use a Map to keep only the last occurrence of each external_id.
      const uniqueRows = Array.from(
        transformedRows.reduce((map, row) => {
          map.set(row.external_id, row);
          return map;
        }, new Map()).values()
      );

      // Bulk Upsert in chunks of 500
      for (let i = 0; i < uniqueRows.length; i += 500) {
        const chunk = uniqueRows.slice(i, i + 500);
        const { error } = await supabase
          .from('payments')
          .upsert(chunk, { onConflict: 'external_id' });

        if (error) throw error;
      }
      
      totalAdded += uniqueRows.length;
    }

    // Log success
    await supabase.from('sync_logs').insert({
      sync_type: 'google_sheets_full',
      status: 'success',
      records_added: totalAdded,
      completed_at: new Date().toISOString()
    });

    return res.status(200).json({ success: true, processed: totalAdded });

  } catch (error) {
    console.error("Sync Error:", error);
    
    // Log failure
    await supabase.from('sync_logs').insert({
      sync_type: 'google_sheets_full',
      status: 'failed',
      error_message: error.message,
      completed_at: new Date().toISOString()
    });

    return res.status(500).json({ error: error.message });
  }
}

// Helper to convert DD-MMM - YY or DD-MMM format to YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split("-");
    if (parts.length < 2) return null;
    
    const day = parts[0].trim();
    const monthStr = parts[1].trim();
    const yearPart = parts[2] ? parts[2].trim() : "26"; // Default to 2026 if missing
    
    const monthMap = { 
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06', 
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' 
    };
    
    const month = monthMap[monthStr] || '01';
    const year = yearPart.length === 2 ? `20${yearPart}` : yearPart;
    
    return `${year}-${month}-${day.padStart(2, '0')}`;
  } catch (e) {
    return null;
  }
}

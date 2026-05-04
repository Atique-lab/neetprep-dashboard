import Papa from "papaparse";

const DOC_ID = "1DZdiG1uVRUz2W9EtJdhkW7RBwniJhaSSivtJtnihTWU";
const BASE_SHEET_URL = `https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv`;

async function fetchCSVData(gid) {
  const res = await fetch(`${BASE_SHEET_URL}&gid=${gid}`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const text = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      complete: (results) => {
        resolve(results.data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

export async function fetchSheetData() {
  return fetchCSVData("0"); // Main Data
}

export async function fetchNewCentreShare() {
  try {
    return await fetchCSVData("137526139"); // New Centre Share
  } catch (error) {
    console.warn("Could not load New Centre Share data:", error);
    return [];
  }
}

export async function fetchLastSessionEnrolments() {
  try {
    // Published CSV URL (File > Share > Publish to web > CSV)
    const PUBLISHED_URL =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vT4cMEDg9HDTf1W786dR8KGQto8XJxUqvqt0Ii5bIyCeiCZm7p6XtbjS_rGiZ46tQwZ2SK4d6uO2bvj/pub?gid=739726484&single=true&output=csv";

    const res = await fetch(PUBLISHED_URL);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const text = await res.text();

    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        complete: (results) => resolve(results.data),
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.warn("Could not load Last Session data:", error);
    return [];
  }
}
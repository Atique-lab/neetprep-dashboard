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
  const LAST_SESSION_DOC_ID = "1Jw3em-neeh8A16_nYyQ5lf_PjAGc0ybM0LEHEWLGHGk";
  const GID = "739726484";

  // Try pub URL first (works when sheet is shared "Anyone with link" without needing Publish to web)
  const urls = [
    `https://docs.google.com/spreadsheets/d/${LAST_SESSION_DOC_ID}/pub?output=csv&gid=${GID}`,
    `https://docs.google.com/spreadsheets/d/${LAST_SESSION_DOC_ID}/export?format=csv&gid=${GID}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const text = await res.text();
      return new Promise((resolve, reject) => {
        Papa.parse(text, {
          complete: (results) => resolve(results.data),
          error: (error) => reject(error),
        });
      });
    } catch (e) {
      // try next URL
    }
  }

  console.warn("Could not load Last Session Enrolments data from any URL");
  return [];
}
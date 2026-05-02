import Papa from "papaparse";

const BASE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/pub";

async function fetchCSVData(gid) {
  const res = await fetch(`${BASE_SHEET_URL}?gid=${gid}&single=true&output=csv`);
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
    return await fetchCSVData("971410532"); // Last Session Enrolments
  } catch (error) {
    console.warn("Could not load Last Session Enrolments data:", error);
    return [];
  }
}
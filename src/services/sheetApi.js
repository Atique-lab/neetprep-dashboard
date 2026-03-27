export async function fetchSheetData() {
  const res = await fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/pub?gid=0&single=true&output=csv");
  const text = await res.text();

  const rows = text.split("\n").map(row => row.split(","));

  return rows;
}
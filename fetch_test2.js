import Papa from "papaparse";

async function fetchSheetGviz(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
  
  const res = await fetch(url);
  const text = await res.text();
  
  return new Promise((resolve) => {
    Papa.parse(text, {
      header: true,
      complete: (results) => {
        resolve(results.data.slice(0, 3));
      }
    });
  });
}

async function run() {
  console.log("Main Data via Gviz:");
  console.log(await fetchSheetGviz("Main Data"));
  
  console.log("\nNew Centre Share via Gviz:");
  console.log(await fetchSheetGviz("New Centre Share"));
}

run();

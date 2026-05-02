import Papa from "papaparse";

async function fetchSheet(sheetName) {
  const baseUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/pub?output=csv";
  let url = baseUrl;
  if (sheetName) {
    url += `&sheet=${encodeURIComponent(sheetName)}`;
  } else {
    url += `&gid=0`;
  }
  
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
  console.log("Main Data:");
  console.log(await fetchSheet(""));
  
  console.log("\nNew Centre Share:");
  console.log(await fetchSheet("New Centre Share"));
  
  console.log("\nLast Session Enrolments:");
  console.log(await fetchSheet("Last Session Enrolments"));
}

run();

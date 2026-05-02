import Papa from "papaparse";

const BASE_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/pub";

async function testFetch(gid) {
  try {
    const url = `${BASE_URL}?gid=${gid}&single=true&output=csv`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed GID ${gid}: ${res.status} ${res.statusText}`);
      return false;
    }
    const text = await res.text();
    console.log(`Success GID ${gid}: starts with "${text.slice(0, 50).replace(/\n/g, "\\n")}"`);
    return true;
  } catch (err) {
    console.error(`Error GID ${gid}: ${err.message}`);
    return false;
  }
}

async function run() {
  await testFetch("137526139");
}

run();

const BASE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSkGqJLIizoOHfge9CDRXIBnFv7e-7his-hAJ539cyvNRP0LewpFYHJsCqzvT_YsErACR9y6rj8uSPM/pub";

async function testFetch(gid) {
  try {
    const res = await fetch(`${BASE_SHEET_URL}?gid=${gid}&single=true&output=csv`);
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
  await testFetch("0");
  await testFetch("137526139");
  await testFetch("971410532");
}

run();

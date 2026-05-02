import Papa from "papaparse";

const DOC_ID = "1DZdiG1uVRUz2W9EtJdhkW7RBwniJhaSSivtJtnihTWU";

async function testFetch(gid) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${DOC_ID}/export?format=csv&gid=${gid}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`Failed GID ${gid}: ${res.status} ${res.statusText}`);
      return false;
    }
    const text = await res.text();
    
    return new Promise((resolve) => {
      Papa.parse(text, {
        complete: (results) => {
          console.log(`\nData for GID ${gid}:`);
          console.log(results.data.slice(0, 3));
          resolve(true);
        }
      });
    });
  } catch (err) {
    console.error(`Error GID ${gid}: ${err.message}`);
    return false;
  }
}

async function run() {
  await testFetch("137526139");
  await testFetch("971410532");
}

run();

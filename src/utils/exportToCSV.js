export function exportToCSV(data, filename) {
  if (!data || !data.length) {
    alert("No data to export");
    return;
  }

  // Extract headers
  const headers = Object.keys(data[0]);

  // Convert to CSV string
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(","));

  // Add rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = "";
      } else if (typeof val === 'string') {
        // Escape quotes and commas
        val = val.replace(/"/g, '""');
        if (val.search(/("|,|\n)/g) >= 0) {
          val = `"${val}"`;
        }
      }
      return val;
    });
    csvRows.push(values.join(","));
  }

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  // Create download link
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith('.csv') ? filename : `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

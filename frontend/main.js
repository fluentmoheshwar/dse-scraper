import "cally";

const scrape = async () => {
  const startDate = document.getElementById("cally1").innerText;
  const endDate = document.getElementById("cally2").innerText;
  console.log("Start Date:", startDate);
  console.log("End Date:", endDate);
  const status = document.getElementById("status");
  status.innerText = "Scraping data...";
  const response = await fetch("/api", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/csv",
    },
    body: JSON.stringify({ startDate, endDate }),
  });
  if (response.ok) {
    status.innerText = "Data scraped successfully! Downloading...";
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dse_data.csv"; // you can customize this filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } else {
    status.innerText = "Failed to scrape data. Please try again.";
  }
};

window.scrape = scrape;

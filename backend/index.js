import { load as htmlparser } from "cheerio";

const api = async (req) => {
  const { startDate, endDate } = await req.json();

  const url = `https://www.dsebd.org/day_end_archive.php?startDate=${startDate}&endDate=${endDate}&inst=All%20Instrument&archive=data`;

  try {
    const response = await fetch(url);
    const data = await response.text();
    const $ = htmlparser(data);
    const table = $(".table-responsive > table");
    if (table.length === 0) {
      return new Response("Table not found", { status: 500 });
    }

    const csvRows = [];

    // Headers
    const headers = [];
    table
      .find("tr")
      .first()
      .find("th")
      .each((_, th) => {
        const header = $(th).text().trim().replace(/"/g, '""');
        headers.push(`"${header}"`);
      });
    csvRows.push(headers.join(","));

    // Data rows
    table
      .find("tr")
      .slice(1)
      .each((_, tr) => {
        const row = [];
        $(tr)
          .find("td")
          .each((_, td) => {
            const text = $(td).text().trim().replace(/"/g, '""');
            row.push(`"${text}"`);
          });
        csvRows.push(row.join(","));
      });

    const csvData = csvRows.join("\n");

    return new Response(csvData, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=dse_data.csv",
      },
    });
  } catch (error) {
    console.error("Error fetching DSE data:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

export default api;

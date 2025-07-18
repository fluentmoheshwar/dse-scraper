import axios from "axios";
import { load as htmlparser } from "cheerio";
import express from "express";

const app = express();
const PORT = process.env.PORT;

app.use(express.json())
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

app.post("/api", async (req, res) => {

  const { startDate, endDate } = await req.body;

  const url =
    `https://www.dsebd.org/day_end_archive.php?startDate=${startDate}&endDate=${endDate}&inst=All%20Instrument&archive=data`;

  try {
    const { data } = await axios.get(url);
    const $ = htmlparser(data);
    const table = $(".table-responsive > table");

    if (table.length === 0) {
      return res.status(500).send("Table not found");
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
    res.header("Content-Type", "text/csv");
    res.attachment("dse_data.csv");
    res.send(csvData);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch or parse DSE data");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

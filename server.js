const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const dataFile = path.join(__dirname, 'reports.json');

app.use(cors());
app.use(express.json());

function readReports() {
  try {
    const file = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(file);
  } catch (error) {
    return [];
  }
}

function writeReports(reports) {
  fs.writeFileSync(dataFile, JSON.stringify(reports, null, 2), 'utf8');
}

app.get('/api/reports', (req, res) => {
  return res.json(readReports());
});

app.post('/api/reports', (req, res) => {
  const report = req.body;
  if (!report || !report.id || !report.category || !report.location) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const reports = readReports();
  const exists = reports.find((r) => r.id === report.id);

  if (exists) {
    const updated = reports.map((r) => (r.id === report.id ? { ...r, ...report } : r));
    writeReports(updated);
    return res.status(200).json(report);
  }

  reports.unshift(report);
  writeReports(reports);
  return res.status(201).json(report);
});

app.patch('/api/reports/:id', (req, res) => {
  const reportId = req.params.id;
  const changes = req.body;
  const reports = readReports();
  let updated = false;

  const newReports = reports.map((report) => {
    if (report.id === reportId) {
      updated = true;
      return { ...report, ...changes };
    }
    return report;
  });

  if (!updated) {
    return res.status(404).json({ error: 'Report not found' });
  }

  writeReports(newReports);
  return res.json(newReports.find((report) => report.id === reportId));
});

app.delete('/api/reports/:id', (req, res) => {
  const reportId = req.params.id;
  const reports = readReports();
  const filtered = reports.filter((report) => report.id !== reportId);

  if (reports.length === filtered.length) {
    return res.status(404).json({ error: 'Report not found' });
  }

  writeReports(filtered);
  return res.json({ success: true });
});

app.listen(port, () => {
  console.log(`Alokjatra backend running on http://localhost:${port}`);
});

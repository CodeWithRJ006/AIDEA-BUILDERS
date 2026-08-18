// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
// Serve static frontend files from the repo root
app.use(express.static(path.join(__dirname, '..')));

const DATA_FILE = path.join(__dirname, 'data.json');
// Initialize data file if missing
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// GET all attendance logs
app.get('/api/attendance', (req, res) => {
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  res.json(data);
});

// POST a new attendance entry
app.post('/api/attendance', (req, res) => {
  const entry = req.body;
  if (!entry || !entry.classId || !entry.timestamp) {
    return res.status(400).json({ error: 'Invalid attendance entry' });
  }
  const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  data.push(entry);
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  res.status(201).json({ message: 'Attendance recorded' });
});

app.listen(PORT, () => {
  console.log(`Attendrix backend listening on port ${PORT}`);
});

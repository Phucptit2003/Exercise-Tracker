// server.js (bản hoàn chỉnh)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
app.use(cors());

// IMPORTANT: middleware để xử lý form data của FCC tests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage
const users = [];      // [{ username, _id }]
const logs = {};       // { _id: [ { description, duration, date: Date } ] }

// POST /api/users -> tạo user mới
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'username required' });

  const _id = randomUUID();
  const newUser = { username, _id };
  users.push(newUser);
  logs[_id] = [];
  // trả về đúng structure { username, _id }
  res.json(newUser);
});

// GET /api/users -> danh sách users
app.get('/api/users', (req, res) => {
  // đảm bảo mỗi phần tử chỉ có username và _id
  const simplified = users.map(u => ({ username: u.username, _id: u._id }));
  res.json(simplified);
});

// POST /api/users/:_id/exercises -> thêm exercise
app.post('/api/users/:_id/exercises', (req, res) => {
  const _id = req.params._id;
  const user = users.find(u => u._id === _id);
  if (!user) return res.status(400).json({ error: 'unknown user id' });

  const description = req.body.description;
  const duration = Number(req.body.duration);
  const dateInput = req.body.date;

  if (!description || !duration) {
    return res.status(400).json({ error: 'description and duration required' });
  }

  let dateObj;
  if (!dateInput) {
    dateObj = new Date();
  } else {
    dateObj = new Date(dateInput);
  }

  if (dateObj.toString() === 'Invalid Date') {
    return res.status(400).json({ error: 'Invalid Date' });
  }

  const exercise = { description, duration, date: dateObj };
  logs[_id].push(exercise);

  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date.toDateString(),
    _id: user._id
  });
});

// GET /api/users/:_id/logs -> trả về log (hỗ trợ from,to,limit)
app.get('/api/users/:_id/logs', (req, res) => {
  const _id = req.params._id;
  const user = users.find(u => u._id === _id);
  if (!user) return res.status(400).json({ error: 'unknown user id' });

  let userLogs = logs[_id] || [];
  const { from, to, limit } = req.query;

  if (from) {
    const fromDate = new Date(from);
    if (fromDate.toString() !== 'Invalid Date') {
      userLogs = userLogs.filter(ex => ex.date >= fromDate);
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (toDate.toString() !== 'Invalid Date') {
      userLogs = userLogs.filter(ex => ex.date <= toDate);
    }
  }

  // count = số lượng exercises **sau khi filter from/to?**
  // Mình để count = userLogs.length (trước apply limit) — phù hợp với FCC reference.
  const totalCount = userLogs.length;

  let limitedLogs = userLogs;
  if (limit) {
    const lim = parseInt(limit);
    if (!isNaN(lim)) limitedLogs = limitedLogs.slice(0, lim);
  }

  const formatted = limitedLogs.map(ex => ({
    description: ex.description,
    duration: ex.duration,
    date: ex.date.toDateString()
  }));

  res.json({
    username: user.username,
    count: totalCount,
    _id: user._id,
    log: formatted
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

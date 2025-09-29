const express = require('express');
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// In-memory storage
const users = [];
const logs = {};

// Create user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  if (!username) return res.status(400).json({ error: 'username required' });

  const _id = randomUUID();
  const newUser = { username, _id };
  users.push(newUser);
  logs[_id] = [];
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise
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

  let dateObj = dateInput ? new Date(dateInput) : new Date();
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

// Get logs
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
    count: userLogs.length,
    _id: user._id,
    log: formatted
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

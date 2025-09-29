const express = require('express');
const app = express();
// Add exercise
app.post('/api/users/:_id/exercises', (req, res) => {
const _id = req.params._id;
const user = users.find(u => u._id === _id);
if (!user) return res.status(400).json({ error: 'unknown user id' });


const description = req.body.description;
const duration = Number(req.body.duration);
const dateInput = req.body.date; // optional


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


// Get logs
app.get('/api/users/:_id/logs', (req, res) => {
const _id = req.params._id;
const user = users.find(u => u._id === _id);
if (!user) return res.status(400).json({ error: 'unknown user id' });


let userLogs = logs[_id] || [];


const { from, to, limit } = req.query;


// Filter by from/to if present (expect yyyy-mm-dd)
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


// Apply limit
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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`Server listening on port ${PORT}`);
});
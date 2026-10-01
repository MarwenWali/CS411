const db = require('../db');

function validateWindow(startTime, endTime) {
  return startTime && endTime && !Number.isNaN(Date.parse(startTime)) && !Number.isNaN(Date.parse(endTime)) && new Date(startTime) < new Date(endTime);
}

function listAvailability(req, res) {
  const rows = req.user.role === 'instructor'
    ? db.prepare('SELECT * FROM availability WHERE instructor_id = ? ORDER BY start_time').all(req.user.id)
    : db.prepare('SELECT * FROM availability ORDER BY start_time').all();
  res.json(rows);
}

function createAvailability(req, res) {
  const { machine_id = null, start_time: startTime, end_time: endTime } = req.body;
  if (!validateWindow(startTime, endTime)) return res.status(400).json({ error: 'A valid start_time before end_time is required' });
  if (machine_id !== null && !db.prepare('SELECT id FROM machines WHERE id = ?').get(machine_id)) return res.status(404).json({ error: 'Machine not found' });
  const result = db.prepare('INSERT INTO availability (instructor_id, machine_id, start_time, end_time) VALUES (?, ?, ?, ?)').run(req.user.id, machine_id, startTime, endTime);
  res.status(201).json(db.prepare('SELECT * FROM availability WHERE id = ?').get(result.lastInsertRowid));
}

function updateAvailability(req, res) {
  const row = db.prepare('SELECT * FROM availability WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Availability not found' });
  if (row.instructor_id !== req.user.id) return res.status(403).json({ error: 'You may edit only your own availability' });
  const next = { ...row, ...req.body };
  if (!validateWindow(next.start_time, next.end_time)) return res.status(400).json({ error: 'A valid start_time before end_time is required' });
  if (next.machine_id !== null && !db.prepare('SELECT id FROM machines WHERE id = ?').get(next.machine_id)) return res.status(404).json({ error: 'Machine not found' });
  db.prepare('UPDATE availability SET machine_id = ?, start_time = ?, end_time = ? WHERE id = ?').run(next.machine_id, next.start_time, next.end_time, req.params.id);
  res.json(db.prepare('SELECT * FROM availability WHERE id = ?').get(req.params.id));
}

module.exports = { listAvailability, createAvailability, updateAvailability };

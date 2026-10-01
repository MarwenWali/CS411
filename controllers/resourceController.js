const db = require('../db');

const componentStatuses = ['available', 'checked_out', 'broken'];
const machineStatuses = ['available', 'in_use', 'broken', 'maintenance'];

function listComponents(req, res) {
  res.json(db.prepare('SELECT * FROM components ORDER BY name').all());
}

function createComponent(req, res) {
  const { name, quantity = 0, status = 'available' } = req.body;
  if (!name || !Number.isInteger(quantity) || quantity < 0 || !componentStatuses.includes(status)) return res.status(400).json({ error: 'Invalid component data' });
  const result = db.prepare('INSERT INTO components (name, quantity, status) VALUES (?, ?, ?)').run(name.trim(), quantity, status);
  res.status(201).json(db.prepare('SELECT * FROM components WHERE id = ?').get(result.lastInsertRowid));
}

function updateComponent(req, res) {
  const current = db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Component not found' });
  const next = { ...current, ...req.body };
  if (!next.name || !Number.isInteger(next.quantity) || next.quantity < 0 || !componentStatuses.includes(next.status)) return res.status(400).json({ error: 'Invalid component data' });
  db.prepare('UPDATE components SET name = ?, quantity = ?, status = ? WHERE id = ?').run(next.name.trim(), next.quantity, next.status, req.params.id);
  res.json(db.prepare('SELECT * FROM components WHERE id = ?').get(req.params.id));
}

function deleteComponent(req, res) {
  const result = db.prepare('DELETE FROM components WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Component not found' });
  res.status(204).send();
}

function listMachines(req, res) {
  res.json(db.prepare('SELECT * FROM machines ORDER BY name').all());
}

function createMachine(req, res) {
  const { name, status = 'available', requires_instructor = false } = req.body;
  if (!name || !machineStatuses.includes(status) || ![true, false, 0, 1].includes(requires_instructor)) return res.status(400).json({ error: 'Invalid machine data' });
  const result = db.prepare('INSERT INTO machines (name, status, requires_instructor) VALUES (?, ?, ?)').run(name.trim(), status, Number(Boolean(requires_instructor)));
  res.status(201).json(db.prepare('SELECT * FROM machines WHERE id = ?').get(result.lastInsertRowid));
}

function updateMachine(req, res) {
  const current = db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'Machine not found' });
  if (req.user.role === 'instructor' && Object.keys(req.body).some((key) => key !== 'status')) return res.status(403).json({ error: 'Instructors may update machine status only' });
  const next = { ...current, ...req.body };
  if (!next.name || !machineStatuses.includes(next.status) || ![true, false, 0, 1].includes(next.requires_instructor)) return res.status(400).json({ error: 'Invalid machine data' });
  db.prepare('UPDATE machines SET name = ?, status = ?, requires_instructor = ? WHERE id = ?').run(next.name.trim(), next.status, Number(Boolean(next.requires_instructor)), req.params.id);
  res.json(db.prepare('SELECT * FROM machines WHERE id = ?').get(req.params.id));
}

function deleteMachine(req, res) {
  const result = db.prepare('DELETE FROM machines WHERE id = ?').run(req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Machine not found' });
  res.status(204).send();
}

module.exports = { listComponents, createComponent, updateComponent, deleteComponent, listMachines, createMachine, updateMachine, deleteMachine };

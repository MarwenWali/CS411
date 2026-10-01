const db = require('../db');

const activeConflictStatuses = ['pending', 'approved', 'active'];

function parseWindow(startTime, endTime) {
  return startTime && endTime && !Number.isNaN(Date.parse(startTime)) && !Number.isNaN(Date.parse(endTime)) && new Date(startTime) < new Date(endTime);
}

function targetExists(targetType, targetId) {
  return targetType === 'component'
    ? db.prepare('SELECT * FROM components WHERE id = ?').get(targetId)
    : db.prepare('SELECT * FROM machines WHERE id = ?').get(targetId);
}

function availabilityCovers(machineId, startTime, endTime) {
  return db.prepare(`SELECT id FROM availability
    WHERE (machine_id = ? OR machine_id IS NULL)
      AND datetime(start_time) <= datetime(?) AND datetime(end_time) >= datetime(?)
    LIMIT 1`).get(machineId, startTime, endTime);
}

function bookingIsConflict(targetType, targetId, startTime, endTime) {
  const placeholders = activeConflictStatuses.map(() => '?').join(',');
  return db.prepare(`SELECT id FROM bookings
    WHERE target_type = ? AND target_id = ? AND status IN (${placeholders})
      AND datetime(start_time) < datetime(?) AND datetime(end_time) > datetime(?)
    LIMIT 1`).get(targetType, targetId, ...activeConflictStatuses, endTime, startTime);
}

function canApprove(booking, user) {
  return user.role === 'management' || (user.role === 'instructor' && booking.target_type === 'machine');
}

function maybeApprove(booking, user) {
  const machine = booking.target_type === 'machine' ? targetExists('machine', booking.target_id) : null;
  if (user.role === 'instructor') {
    db.prepare('UPDATE bookings SET instructor_approved_by = ? WHERE id = ?').run(user.id, booking.id);
    booking.instructor_approved_by = user.id;
  } else {
    db.prepare('UPDATE bookings SET approved_by = ? WHERE id = ?').run(user.id, booking.id);
    booking.approved_by = user.id;
  }

  const instructorReady = !machine || !machine.requires_instructor || (booking.instructor_approved_by && availabilityCovers(booking.target_id, booking.start_time, booking.end_time));
  if (instructorReady && (booking.approved_by || !machine || !machine.requires_instructor)) {
    db.prepare('UPDATE bookings SET status = \'approved\' WHERE id = ?').run(booking.id);
  }
  return db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id);
}

function listBookings(req, res) {
  const query = req.user.role === 'student'
    ? 'SELECT * FROM bookings WHERE user_id = ? ORDER BY start_time DESC'
    : 'SELECT * FROM bookings ORDER BY start_time DESC';
  res.json(req.user.role === 'student' ? db.prepare(query).all(req.user.id) : db.prepare(query).all());
}

function createBooking(req, res) {
  const { target_type: targetType, target_id: targetId, start_time: startTime, end_time: endTime } = req.body;
  if (!['component', 'machine'].includes(targetType) || !targetId || !parseWindow(startTime, endTime)) return res.status(400).json({ error: 'Invalid booking data' });

  const insertBooking = db.transaction(() => {
    const target = targetExists(targetType, targetId);
    if (!target) return { error: 'Target not found', status: 404 };
    if (target.status !== 'available') return { error: 'Target is not available for booking', status: 409 };
    if (bookingIsConflict(targetType, targetId, startTime, endTime)) return { error: 'Booking overlaps an existing booking', status: 409 };
    const result = db.prepare(`INSERT INTO bookings (user_id, target_type, target_id, start_time, end_time, status)
      VALUES (?, ?, ?, ?, ?, 'pending')`).run(req.user.id, targetType, targetId, startTime, endTime);
    return { booking: db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid) };
  });

  const result = insertBooking();
  if (result.error) return res.status(result.status).json({ error: result.error });
  return res.status(201).json(result.booking);
}

function approveBooking(req, res) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(409).json({ error: 'Only pending bookings can be approved' });
  if (!canApprove(booking, req.user)) return res.status(403).json({ error: 'You cannot approve this booking' });
  if (req.user.role === 'instructor' && booking.target_type !== 'machine') return res.status(403).json({ error: 'Instructors approve machine bookings only' });
  if (req.user.role === 'instructor' && !targetExists('machine', booking.target_id).requires_instructor) return res.status(403).json({ error: 'This machine does not require instructor approval' });
  res.json(maybeApprove(booking, req.user));
}

function rejectBooking(req, res) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(409).json({ error: 'Only pending bookings can be rejected' });
  if (!canApprove(booking, req.user)) return res.status(403).json({ error: 'You cannot reject this booking' });
  db.prepare('UPDATE bookings SET status = ?, approved_by = COALESCE(approved_by, ?), instructor_approved_by = COALESCE(instructor_approved_by, ?) WHERE id = ?').run('rejected', req.user.role === 'management' ? req.user.id : null, req.user.role === 'instructor' ? req.user.id : null, booking.id);
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id));
}

function returnBooking(req, res) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (!['approved', 'active', 'overdue'].includes(booking.status)) return res.status(409).json({ error: 'Booking cannot be returned in its current state' });
  if (req.user.role === 'student' && booking.user_id !== req.user.id) return res.status(403).json({ error: 'You may return only your own booking' });
  db.transaction(() => {
    db.prepare('UPDATE bookings SET status = \'returned\' WHERE id = ?').run(booking.id);
    const table = booking.target_type === 'component' ? 'components' : 'machines';
    db.prepare(`UPDATE ${table} SET status = 'available' WHERE id = ?`).run(booking.target_id);
  })();
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id));
}

function cancelBooking(req, res) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.user_id !== req.user.id) return res.status(403).json({ error: 'You may cancel only your own booking' });
  if (booking.status !== 'pending') return res.status(409).json({ error: 'Only pending bookings can be cancelled' });
  db.prepare('UPDATE bookings SET status = \'rejected\' WHERE id = ?').run(booking.id);
  res.json(db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking.id));
}

function markOverdue() {
  db.prepare(`UPDATE bookings SET status = 'overdue'
    WHERE status = 'active' AND datetime(end_time) < datetime('now')`).run();
}

module.exports = { listBookings, createBooking, approveBooking, rejectBooking, returnBooking, cancelBooking, markOverdue };

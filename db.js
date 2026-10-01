const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
require('dotenv').config();

const databaseFile = process.env.DATABASE_FILE || './data/fablab.sqlite';
const resolvedDatabaseFile = path.resolve(databaseFile);
fs.mkdirSync(path.dirname(resolvedDatabaseFile), { recursive: true });

const db = new Database(resolvedDatabaseFile);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'management', 'instructor')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out', 'broken')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS machines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'broken', 'maintenance')),
    requires_instructor INTEGER NOT NULL DEFAULT 0 CHECK (requires_instructor IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    instructor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    machine_id INTEGER REFERENCES machines(id) ON DELETE CASCADE,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    CHECK (datetime(start_time) < datetime(end_time))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('component', 'machine')),
    target_id INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'returned', 'overdue')),
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    instructor_approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (datetime(start_time) < datetime(end_time))
  );

  CREATE INDEX IF NOT EXISTS idx_bookings_target_time ON bookings(target_type, target_id, start_time, end_time);
  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_availability_machine_time ON availability(machine_id, start_time, end_time);
`);

// Keeps databases created by an earlier version compatible with instructor approvals.
const bookingColumns = db.prepare('PRAGMA table_info(bookings)').all().map((column) => column.name);
if (!bookingColumns.includes('instructor_approved_by')) {
  db.exec('ALTER TABLE bookings ADD COLUMN instructor_approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL');
}

module.exports = db;

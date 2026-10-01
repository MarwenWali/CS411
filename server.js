require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./db');
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const availabilityRoutes = require('./routes/availability');
const bookingRoutes = require('./routes/bookings');
const { markOverdue } = require('./controllers/bookingController');

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/', resourceRoutes);
app.use('/availability', availabilityRoutes);
app.use('/bookings', bookingRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

markOverdue();
const overdueTimer = setInterval(markOverdue, 5 * 60 * 1000);
overdueTimer.unref();

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, '0.0.0.0', () => console.log(`Fablab API listening on 0.0.0.0:${port}`));

function shutdown() {
  clearInterval(overdueTimer);
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = app;

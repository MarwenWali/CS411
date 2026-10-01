const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/bookingController');

const router = express.Router();
router.use(authenticate);
router.get('/', controller.listBookings);
router.post('/', controller.createBooking);
router.patch('/:id/approve', requireRole('management', 'instructor'), controller.approveBooking);
router.patch('/:id/reject', requireRole('management', 'instructor'), controller.rejectBooking);
router.patch('/:id/return', controller.returnBooking);
router.patch('/:id/cancel', controller.cancelBooking);
module.exports = router;

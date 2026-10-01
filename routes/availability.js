const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { listAvailability, createAvailability, updateAvailability } = require('../controllers/availabilityController');

const router = express.Router();
router.use(authenticate);
router.get('/', listAvailability);
router.post('/', requireRole('instructor'), createAvailability);
router.patch('/:id', requireRole('instructor'), updateAvailability);
module.exports = router;

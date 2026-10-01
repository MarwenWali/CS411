const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const controller = require('../controllers/resourceController');

const router = express.Router();
router.use(authenticate);

router.get('/components', controller.listComponents);
router.post('/components', requireRole('management'), controller.createComponent);
router.patch('/components/:id', requireRole('management'), controller.updateComponent);
router.delete('/components/:id', requireRole('management'), controller.deleteComponent);

router.get('/machines', controller.listMachines);
router.post('/machines', requireRole('management'), controller.createMachine);
router.patch('/machines/:id', requireRole('management', 'instructor'), controller.updateMachine);
router.delete('/machines/:id', requireRole('management'), controller.deleteMachine);

module.exports = router;

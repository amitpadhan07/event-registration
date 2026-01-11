const express = require('express');
const router = express.Router();
const { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent } = require('../controllers/eventController');
const { adminAuth } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// Protected Admin Routes (Require Password)
router.post('/', adminAuth, createEvent);
router.put('/:id', adminAuth, updateEvent);
router.delete('/:id', adminAuth, deleteEvent);

module.exports = router;
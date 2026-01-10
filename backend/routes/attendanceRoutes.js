const express = require('express');
const router = express.Router();
const { verifyAndMarkAttendance, getAttendanceStats } = require('../controllers/attendanceController');

router.post('/verify', verifyAndMarkAttendance);
router.get('/stats/:eventId', getAttendanceStats);

module.exports = router;
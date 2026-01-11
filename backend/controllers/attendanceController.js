const pool = require('../config/database');

async function verifyAndMarkAttendance(req, res) {
  try {
    const { registrationCode } = req.body;

    if (!registrationCode) {
      return res.status(400).json({ success: false, message: 'Registration code is required' });
    }

    // 1. Find Registration
    const query = `
      SELECT r.*, e.title as event_title, e.event_date, e.venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.registration_code = $1
    `;
    const result = await pool.query(query, [registrationCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Invalid registration code' });
    }

    const registration = result.rows[0];
    let alreadyCheckedIn = registration.attendance;

    // 2. Mark Attendance (if not already marked)
    if (!alreadyCheckedIn) {
      await pool.query('UPDATE registrations SET attendance = TRUE WHERE registration_code = $1', [registrationCode]);
    }

    // 3. 👇 NEW: Fetch Live Stats for this Event
    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE attendance = TRUE) as checked_in
      FROM registrations
      WHERE event_id = $1
    `;
    const statsResult = await pool.query(statsQuery, [registration.event_id]);
    const stats = statsResult.rows[0];

    // 4. Send Response with Stats
    res.json({
      success: true,
      alreadyCheckedIn,
      message: alreadyCheckedIn ? 'Attendee already checked in' : 'Attendance marked successfully',
      registration: {
        name: registration.name,
        email: registration.email,
        eventTitle: registration.event_title,
        venue: registration.venue
      },
      stats: { // Return the stats to frontend
        total: parseInt(stats.total),
        checkedIn: parseInt(stats.checked_in),
        remaining: parseInt(stats.total) - parseInt(stats.checked_in)
      }
    });

  } catch (error) {
    console.error('Attendance verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to verify attendance' });
  }
}

async function getAttendanceStats(req, res) {
  try {
    const { eventId } = req.params;

    const query = `
      SELECT 
        COUNT(*) as total_registrations,
        COUNT(*) FILTER (WHERE attendance = TRUE) as checked_in,
        COUNT(*) FILTER (WHERE attendance = FALSE) as pending
      FROM registrations
      WHERE event_id = $1
    `;

    const result = await pool.query(query, [eventId]);

    res.json({
      success: true,
      stats: result.rows[0]
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
}

module.exports = { verifyAndMarkAttendance, getAttendanceStats };
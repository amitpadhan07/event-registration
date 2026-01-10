const pool = require('../config/database');

async function verifyAndMarkAttendance(req, res) {
  try {
    const { registrationCode } = req.body;

    if (!registrationCode) {
      return res.status(400).json({
        success: false,
        message: 'Registration code is required'
      });
    }

    const query = `
      SELECT 
        r.*,
        e.title as event_title,
        e.event_date,
        e.venue
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      WHERE r.registration_code = $1
    `;

    const result = await pool.query(query, [registrationCode]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invalid registration code'
      });
    }

    const registration = result.rows[0];

    if (registration.attendance) {
      return res.status(200).json({
        success: true,
        alreadyCheckedIn: true,
        message: 'Attendee already checked in',
        registration: {
          name: registration.name,
          email: registration.email,
          eventTitle: registration.event_title,
          checkedInAt: registration.created_at
        }
      });
    }

    const updateQuery = `
      UPDATE registrations
      SET attendance = TRUE
      WHERE registration_code = $1
      RETURNING *
    `;

    await pool.query(updateQuery, [registrationCode]);

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      registration: {
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        eventTitle: registration.event_title,
        eventDate: registration.event_date,
        venue: registration.venue
      }
    });

  } catch (error) {
    console.error('Attendance verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify attendance'
    });
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
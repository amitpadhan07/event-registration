const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const { generateQRCode } = require('../utils/qrCodeGenerator');
const { sendConfirmationEmail } = require('../utils/emailService');

async function createRegistration(req, res) {
  const client = await pool.connect();
  
  try {
    const { name, email, phone, eventId } = req.body;

    await client.query('BEGIN');

    const eventQuery = `
      SELECT 
        e.*,
        COUNT(r.id) as registered_count
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    const eventResult = await client.query(eventQuery, [eventId]);

    if (eventResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const event = eventResult.rows[0];
    const availableSeats = event.max_seats - event.registered_count;

    if (availableSeats <= 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Event is fully booked'
      });
    }

    const duplicateCheck = await client.query(
      'SELECT id FROM registrations WHERE email = $1 AND event_id = $2',
      [email, eventId]
    );

    if (duplicateCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    const registrationCode = `EVT-${uuidv4()}`;

    const insertQuery = `
      INSERT INTO registrations (name, email, phone, event_id, registration_code)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const registrationResult = await client.query(insertQuery, [
      name,
      email,
      phone,
      eventId,
      registrationCode
    ]);

    const registration = registrationResult.rows[0];

    const qrCodeDataURL = await generateQRCode(registrationCode);

    await sendConfirmationEmail(
      {
        name,
        email,
        event,
        registrationCode
      },
      qrCodeDataURL
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Registration successful! Check your email for confirmation.',
      registration: {
        id: registration.id,
        name: registration.name,
        email: registration.email,
        registrationCode: registration.registration_code,
        eventTitle: event.title
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  } finally {
    client.release();
  }
}

module.exports = { createRegistration };
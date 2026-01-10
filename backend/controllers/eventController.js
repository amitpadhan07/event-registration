const pool = require('../config/database');

async function getAllEvents(req, res) {
  try {
    const query = `
      SELECT 
        e.*,
        COUNT(r.id) as registered_count,
        (e.max_seats - COUNT(r.id)) as available_seats
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.event_date >= CURRENT_DATE
      GROUP BY e.id
      ORDER BY e.event_date, e.event_time
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      events: result.rows
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
}

async function getEventById(req, res) {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        e.*,
        COUNT(r.id) as registered_count,
        (e.max_seats - COUNT(r.id)) as available_seats
      FROM events e
      LEFT JOIN registrations r ON e.id = r.event_id
      WHERE e.id = $1
      GROUP BY e.id
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
}

module.exports = { getAllEvents, getEventById };
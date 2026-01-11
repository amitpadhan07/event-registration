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

async function createEvent(req, res) {
  try {
    const { title, event_date, event_time, venue, max_seats } = req.body;
    const query = `
      INSERT INTO events (title, event_date, event_time, venue, max_seats)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [title, event_date, event_time, venue, max_seats]);
    res.status(201).json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event' });
  }
}

async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, event_date, event_time, venue, max_seats } = req.body;
    const query = `
      UPDATE events 
      SET title = $1, event_date = $2, event_time = $3, venue = $4, max_seats = $5
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [title, event_date, event_time, venue, max_seats, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, event: result.rows[0] });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event' });
  }
}

async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    // Check for registrations first (optional safety)
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event' });
  }
}


module.exports = { getAllEvents, getEventById, createEvent, updateEvent, deleteEvent };
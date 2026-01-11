const API_URL = '/api/events';
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
  if (eventId) {
    document.getElementById('form-title').textContent = 'Edit Event';
    await loadEventData(eventId);
  }
});

async function loadEventData(id) {
  const res = await fetch(`${API_URL}/${id}`);
  const data = await res.json();
  if (data.success) {
    const e = data.event;
    document.getElementById('title').value = e.title;
    // Format date to YYYY-MM-DD for input
    document.getElementById('event_date').value = new Date(e.event_date).toISOString().split('T')[0];
    document.getElementById('event_time').value = e.event_time;
    document.getElementById('venue').value = e.venue;
    document.getElementById('max_seats').value = e.max_seats;
  }
}

document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const formData = {
    title: document.getElementById('title').value,
    event_date: document.getElementById('event_date').value,
    event_time: document.getElementById('event_time').value,
    venue: document.getElementById('venue').value,
    max_seats: document.getElementById('max_seats').value
  };

  const method = eventId ? 'PUT' : 'POST';
  const url = eventId ? `${API_URL}/${eventId}` : API_URL;

  try {
    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    const data = await res.json();
    if (data.success) {
      alert('Event saved successfully!');
      window.location.href = 'manage-events.html';
    } else {
      alert('Error: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Failed to save event.');
  }
});
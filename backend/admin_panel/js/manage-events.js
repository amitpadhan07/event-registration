const API_URL = '/api/events';

async function loadEvents() {
  const container = document.getElementById('events-list');
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (!data.success || data.events.length === 0) {
      container.innerHTML = '<p>No events found.</p>';
      return;
    }

    container.innerHTML = data.events.map(event => `
      <div class="event-card">
        <h3>${escapeHtml(event.title)}</h3>
        <p>📅 ${new Date(event.event_date).toLocaleDateString()}</p>
        <p>📍 ${escapeHtml(event.venue)}</p>
        <div style="margin-top: 15px; display: flex; gap: 10px;">
          <a href="event-form.html?id=${event.id}" class="btn btn-primary">Edit</a>
          <button onclick="deleteEvent(${event.id})" class="btn" style="background: var(--danger); color: white;">Delete</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Error loading events.</p>';
  }
}

async function deleteEvent(id) {
  if (!confirm('Are you sure? This will delete all registrations for this event!')) return;
  
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadEvents();
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert('Delete failed');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadEvents);
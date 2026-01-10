// Use relative API URL - works both locally and on Render
const API_URL = '/api';

async function loadEvents() {
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const eventsContainer = document.getElementById('events-container');

  try {
    const response = await fetch(`${API_URL}/events`);
    const data = await response.json();

    loading.style.display = 'none';

    if (!data.success) {
      throw new Error(data.message || 'Failed to load events');
    }

    if (data.events.length === 0) {
      eventsContainer.innerHTML = '<p style="text-align: center;">No upcoming events available.</p>';
      eventsContainer.style.display = 'block';
      return;
    }

    eventsContainer.innerHTML = data.events.map(event => createEventCard(event)).join('');
    eventsContainer.style.display = 'grid';

  } catch (error) {
    console.error('Error loading events:', error);
    loading.style.display = 'none';
    errorMessage.textContent = 'Failed to load events. Please try again later.';
    errorMessage.style.display = 'block';
  }
}

function createEventCard(event) {
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const availableSeats = parseInt(event.available_seats);
  const isFull = availableSeats <= 0;
  const seatsClass = isFull ? 'seats-full' : 'seats-available';

  return `
    <div class="event-card">
      <h3>${escapeHtml(event.title)}</h3>
      <div class="event-info">
        <span>📅 ${formattedDate}</span>
      </div>
      <div class="event-info">
        <span>🕐 ${event.event_time}</span>
      </div>
      <div class="event-info">
        <span>📍 ${escapeHtml(event.venue)}</span>
      </div>
      <div class="seats-info">
        <span>Total Seats: ${event.max_seats}</span>
        <span class="${seatsClass}">
          ${isFull ? 'SOLD OUT' : `${availableSeats} seats left`}
        </span>
      </div>
      ${isFull 
        ? '<button class="btn btn-primary" disabled>Fully Booked</button>'
        : `<a href="register.html?eventId=${event.id}" class="btn btn-primary">Register Now</a>`
      }
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadEvents);
const API_URL = '/api';

let currentEventId = null;

async function loadEventDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  currentEventId = urlParams.get('eventId');

  if (!currentEventId) {
    window.location.href = '/';
    return;
  }

  const loading = document.getElementById('loading');
  const formContainer = document.getElementById('registration-form-container');

  try {
    const response = await fetch(`${API_URL}/events/${currentEventId}`);
    const data = await response.json();

    loading.style.display = 'none';

    if (!data.success) {
      throw new Error(data.message || 'Event not found');
    }

    const event = data.event;
    
    if (parseInt(event.available_seats) <= 0) {
      alert('Sorry, this event is fully booked!');
      window.location.href = '/';
      return;
    }

    displayEventDetails(event);
    formContainer.style.display = 'block';

  } catch (error) {
    console.error('Error loading event:', error);
    alert('Failed to load event details');
    window.location.href = '/';
  }
}

function displayEventDetails(event) {
  const eventDetails = document.getElementById('event-details');
  const eventDate = new Date(event.event_date);
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  eventDetails.innerHTML = `
    <h3>${escapeHtml(event.title)}</h3>
    <p><strong>Date:</strong> ${formattedDate}</p>
    <p><strong>Time:</strong> ${event.event_time}</p>
    <p><strong>Venue:</strong> ${escapeHtml(event.venue)}</p>
    <p><strong>Available Seats:</strong> ${event.available_seats} / ${event.max_seats}</p>
  `;
}

document.getElementById('registration-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  successMessage.style.display = 'none';
  errorMessage.style.display = 'none';

  const formData = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    eventId: currentEventId
  };

  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';

  try {
    const response = await fetch(`${API_URL}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();

    if (data.success) {
      successMessage.innerHTML = `
        <strong>✅ ${data.message}</strong><br>
        <p>Registration Code: <strong>${data.registration.registrationCode}</strong></p>
        <p>A confirmation email with your QR code has been sent to ${data.registration.email}</p>
      `;
      successMessage.style.display = 'block';
      document.getElementById('registration-form').reset();
      
      setTimeout(() => {
        window.location.href = '/';
      }, 5000);
    } else {
      throw new Error(data.message || 'Registration failed');
    }

  } catch (error) {
    console.error('Registration error:', error);
    errorMessage.textContent = error.message || 'Registration failed. Please try again.';
    errorMessage.style.display = 'block';
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register for Event';
  }
});

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', loadEventDetails);
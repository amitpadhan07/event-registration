const API_URL = '/api';

document.getElementById('verify-btn').addEventListener('click', verifyAttendance);

document.getElementById('qr-code-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    verifyAttendance();
  }
});

async function verifyAttendance() {
  const input = document.getElementById('qr-code-input');
  const registrationCode = input.value.trim();
  const resultContainer = document.getElementById('result-container');

  if (!registrationCode) {
    alert('Please enter a registration code');
    return;
  }

  resultContainer.innerHTML = '<div class="loading"><div class="spinner"></div><p>Verifying...</p></div>';

  try {
    const response = await fetch(`${API_URL}/attendance/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ registrationCode })
    });

    const data = await response.json();

    if (data.success) {
      displaySuccessResult(data);
    } else {
      displayErrorResult(data.message);
    }

    input.value = '';
    input.focus();

  } catch (error) {
    console.error('Verification error:', error);
    displayErrorResult('Verification failed. Please try again.');
  }
}

function displaySuccessResult(data) {
  const resultContainer = document.getElementById('result-container');
  const { registration, alreadyCheckedIn } = data;

  resultContainer.innerHTML = `
    <div class="result-card result-success">
      <h3 style="color: var(--success);">
        ${alreadyCheckedIn ? '⚠️ Already Checked In' : '✅ Attendance Verified'}
      </h3>
      <div class="attendee-info">
        <p><strong>Name:</strong> <span>${escapeHtml(registration.name)}</span></p>
        <p><strong>Email:</strong> <span>${escapeHtml(registration.email)}</span></p>
        ${registration.phone ? `<p><strong>Phone:</strong> <span>${escapeHtml(registration.phone)}</span></p>` : ''}
        <p><strong>Event:</strong> <span>${escapeHtml(registration.eventTitle)}</span></p>
        ${registration.venue ? `<p><strong>Venue:</strong> <span>${escapeHtml(registration.venue)}</span></p>` : ''}
      </div>
      <p style="margin-top: 20px; text-align: center;">
        ${alreadyCheckedIn ? 'This attendee was already checked in.' : 'Attendance marked successfully!'}
      </p>
    </div>
  `;
}

function displayErrorResult(message) {
  const resultContainer = document.getElementById('result-container');
  
  resultContainer.innerHTML = `
    <div class="result-card result-error">
      <h3 style="color: var(--danger);">❌ Verification Failed</h3>
      <p style="text-align: center; margin-top: 20px;">${escapeHtml(message)}</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
const API_URL = '/api';

// --- 📷 Camera Scanner Logic ---

function onScanSuccess(decodedText, decodedResult) {
  // 1. Play a beep sound (Optional)
  if (navigator.vibrate) {
     navigator.vibrate(200);
  }
   const audio = new Audio('/beep.mp3'); audio.play();

  console.log(`Code scanned = ${decodedText}`);

  // 2. Fill the input field
  const input = document.getElementById('qr-code-input');
  
  // Prevent duplicate scans of the same code immediately
  if (input.value === decodedText) return;

  input.value = decodedText;

  // 3. Automatically trigger verification
  verifyAttendance();
  
  // Note: We don't stop the scanner so you can scan the next person immediately.
}

function onScanFailure(error) {
  // console.warn(`Code scan error = ${error}`);
}

// Initialize the scanner
// "reader" matches the div ID in HTML
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: { width: 250, height: 250 } },
  /* verbose= */ false
);

html5QrcodeScanner.render(onScanSuccess, onScanFailure);


// --- ⌨️ Existing Verification Logic ---

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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ registrationCode })
    });

    const data = await response.json();

    if (data.success) {
      displaySuccessResult(data);
      // 👇 NEW: Update the stats UI
      updateStats(data.stats);
    } else {
      displayErrorResult(data.message);
    }
  } catch (error) {
    console.error('Verification error:', error);
    displayErrorResult('Verification failed. Please try again.');
  }
}

function updateStats(stats) {
  if (!stats) return;

  const statsContainer = document.getElementById('stats-container');
  const checkedInEl = document.getElementById('stat-checked-in');
  const totalEl = document.getElementById('stat-total');
  const remainingEl = document.getElementById('stat-remaining');

  // Show the container
  statsContainer.style.display = 'block';

  // Animate numbers (simple text update)
  checkedInEl.textContent = stats.checkedIn;
  totalEl.textContent = stats.total;
  remainingEl.textContent = stats.remaining;
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
        <p><strong>Event:</strong> <span>${escapeHtml(registration.eventTitle)}</span></p>
      </div>
      <p style="margin-top: 20px; text-align: center;">
        ${alreadyCheckedIn ? 'Attendee already checked in.' : 'Marked successfully!'}
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
  div.textContent = text || '';
  return div.innerHTML;
}
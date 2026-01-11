const API_URL = '/api';

// --- 🔊 BEEP SOUND SETUP ---
const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19WAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

// --- 🧪 TEST VIBRATION BUTTON ---
// Add this temporarily to your HTML if you want to test manually
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if(header) {
        const btn = document.createElement('button');
        btn.innerText = "📳 Test Vibration";
        btn.style = "margin-top: 10px; padding: 5px 10px; background: #eee; border: 1px solid #ccc; border-radius: 5px; cursor: pointer;";
        btn.onclick = () => {
            console.log("Testing vibration...");
            triggerFeedback();
            alert("Did it vibrate?");
        };
        header.appendChild(btn);
    }
});

// --- 📷 Camera Scanner Logic ---

function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code scanned = ${decodedText}`);

  const input = document.getElementById('qr-code-input');
  
  // Prevent duplicate scans
  if (input.value === decodedText) return;

  input.value = decodedText;

  // Trigger verification
  verifyAttendance();
}

function onScanFailure(error) {
  // console.warn(`Code scan error = ${error}`);
}

const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: { width: 250, height: 250 } },
  false
);

html5QrcodeScanner.render(onScanSuccess, onScanFailure);


// --- ⌨️ Verification Logic ---

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
      // ✅ SUCCESS! Trigger Feedback
      triggerFeedback();

      displaySuccessResult(data);
      
      if (typeof updateStats === "function") {
        updateStats(data.stats);
      }
    } else {
      displayErrorResult(data.message);
    }

  } catch (error) {
    console.error('Verification error:', error);
    displayErrorResult('Verification failed.');
  }
}

// Helper function for Sound + Stronger Vibration
function triggerFeedback() {
  // 1. 📳 Vibrate (Pattern: Vibrate 200ms, Pause 100ms, Vibrate 200ms)
  try {
    if (window.navigator && window.navigator.vibrate) {
      // Trying a pattern - stronger effect
      const success = window.navigator.vibrate([200, 100, 200]);
      console.log("Vibration command sent:", success);
    } else {
      console.log("Vibration API not supported");
    }
  } catch (e) {
    console.log("Vibration failed:", e);
  }

  // 2. 🔊 Play Beep
  try {
    beepSound.play().catch(e => console.log("Audio play failed (interaction needed)"));
  } catch (e) {
    console.log("Sound failed");
  }
}

function updateStats(stats) {
  if (!stats) return;
  const statsContainer = document.getElementById('stats-container');
  if(statsContainer) {
    statsContainer.style.display = 'block';
    document.getElementById('stat-checked-in').textContent = stats.checkedIn;
    document.getElementById('stat-total').textContent = stats.total;
    document.getElementById('stat-remaining').textContent = stats.remaining;
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
        <p><strong>Event:</strong> <span>${escapeHtml(registration.eventTitle)}</span></p>
      </div>
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
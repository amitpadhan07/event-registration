const API_URL = '/api';

// --- 🔊 BEEP SOUND SETUP ---
// High pitch beep for success
const beepSound = new Audio("data:audio/wav;base64,UklGRl9vT19WAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU");

// --- 🧪 TEST BUTTON (Debug) ---
document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('header');
    if(header) {
        const btn = document.createElement('button');
        btn.innerText = "📳 Test Vibration";
        btn.style = "margin-top: 10px; padding: 8px 15px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;";
        btn.onclick = () => {
            triggerFeedback(true); // Force test
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

  // Verification process start
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
      // ✅ SUCCESS! Trigger Feedback IMMEDIATELY
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

// --- 📳 ROBUST FEEDBACK FUNCTION ---
function triggerFeedback(isTest = false) {
  console.log("Attempting feedback...");

  // 1. VIBRATE (Simple Single Pulse)
  // Android allows simple vibrations more easily inside async functions
  try {
    if (navigator.vibrate) {
      // Vibrate for 400ms (Stronger single buzz)
      const result = navigator.vibrate(400); 
      console.log("Vibration result:", result);
      
      if(isTest) alert("Vibration Command Sent: " + result);
    } else {
      console.log("Navigator.vibrate not supported");
      if(isTest) alert("Vibration NOT supported on this device/browser");
    }
  } catch (e) {
    console.error("Vibration Error:", e);
  }

  // 2. SOUND
  try {
    beepSound.currentTime = 0;
    const playPromise = beepSound.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.log("Audio playback failed (interaction needed):", error);
      });
    }
  } catch (e) {
    console.error("Sound Error:", e);
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

  // Add a debug text for vibration status
  const vibeStatus = (navigator.vibrate) ? "" : "(No Vibe Support)";

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
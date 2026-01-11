const dns = require('node:dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
// 👇 Import the centralized auth middleware we just created
const { adminAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 🔒 PROTECTED ROUTES (Require Password) ---

// 1. Serve Admin Panel
// When someone visits /admin, check password first, then serve the files
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin_panel')));

// 2. Protect Attendance API
// Prevents external scripts from marking attendance without password
app.use('/api/attendance', adminAuth, attendanceRoutes);


// --- 🌍 PUBLIC ROUTES (Open to everyone) ---

// 3. API Routes
app.use('/api/events', eventRoutes); // Events are public (GET) or protected (POST/PUT/DELETE) inside the route file
app.use('/api/registrations', registrationRoutes); // Registration is public

// 4. Serve Public Frontend (HTML/CSS/JS)
app.use(express.static(path.join(__dirname, 'public')));


// --- 🛠️ UTILITIES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend index.html for any unknown routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Global Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Public App: http://localhost:${PORT}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin`);
});
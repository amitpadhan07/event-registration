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
const { adminAuth } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 🔒 PROTECTED ROUTES ---
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin_panel')));
app.use('/api/attendance', adminAuth, attendanceRoutes);

// --- 🌍 PUBLIC API ROUTES ---
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// --- 📄 STATIC PAGES & ROUTING ---
// Serve static assets (CSS, JS, Images)
app.use(express.static(path.join(__dirname, 'public')));

// Explicit Routes for Multi-Page Layout
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/member-drive', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'member-drive.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Register page (Specific event registration)
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1><a href="/">Go Home</a>');
});

// Global Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Website: http://localhost:${PORT}`);
});
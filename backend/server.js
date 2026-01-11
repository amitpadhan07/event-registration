const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 🔒 SECURITY: Admin Password Check (Basic Auth) ---
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Authentication required');
  }

  // Base64 decode karke username:password nikalna
  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const user = auth[0];
  const pass = auth[1];

  // 👇 CHANGE THIS: Yahan apna username aur password set karein
  if (user === 'admin' && pass === 'admin123') {
    next(); // Access granted
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    res.status(401).send('Access denied');
  }
};

// 1. Serve Admin Panel (Protected)
// Ab '/admin' kholne par password mangega
app.use('/admin', adminAuth, express.static(path.join(__dirname, 'admin_panel')));

// 2. API Routes
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// 3. Protect Attendance API (Taaki koi script se attendance mark na kar sake)
app.use('/api/attendance', adminAuth, attendanceRoutes);

// 4. Serve Public Frontend (Open for everyone)
app.use(express.static(path.join(__dirname, 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  // Agar user /admin par kuch galat type kare to bhi admin index dikhana chahiye,
  // par simple rakhne ke liye hum public index dikha rahe hain.
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
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
  console.log(`Pb Admin Panel: http://localhost:${PORT}/admin (User: admin, Pass: admin123)`);
});
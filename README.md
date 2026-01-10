# Event Registration System

A complete event registration platform with QR code-based attendance tracking.

## Features

✅ Event listing with real-time seat availability  
✅ User registration with email confirmation  
✅ QR code generation for each registration  
✅ Email notifications with embedded QR codes  
✅ Admin panel for QR code scanning  
✅ Attendance tracking system  
✅ Duplicate registration prevention  
✅ Responsive design  

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- Gmail account (for email notifications)

## Installation Steps

### 1. Database Setup

```bash
# Create PostgreSQL database
createdb event_registration

# Run the schema
psql -d event_registration -f database/schema.sql
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# - Database credentials
# - Gmail credentials (use App Password for Gmail)
```

**Gmail App Password Setup:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Use this password in .env file

### 3. Start Backend Server

```bash
npm start
# Server runs on http://localhost:5000
```

### 4. Frontend Setup

```bash
# Serve frontend files using any static server
# Option 1: Using Python
cd frontend
python3 -m http.server 3000

# Option 2: Using Node.js http-server
npx http-server frontend -p 3000

# Option 3: Using VS Code Live Server extension
```

## Usage

### User Flow

1. **Browse Events**: Visit `http://localhost:3000`
2. **Register**: Click "Register Now" on any event
3. **Fill Form**: Enter name, email, phone
4. **Receive Email**: Check email for QR code
5. **Attend Event**: Show QR code at venue

### Admin Flow

1. **Access Admin Panel**: Visit `http://localhost:3000/admin.html`
2. **Scan QR Code**: Enter registration code from attendee's QR
3. **Verify**: System marks attendance and shows attendee details

## API Endpoints

### Events
- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details

### Registrations
- `POST /api/registrations` - Create registration

### Attendance
- `POST /api/attendance/verify` - Verify and mark attendance
- `GET /api/attendance/stats/:eventId` - Get attendance statistics

## Testing

### Test Registration Flow

1. Start both servers (backend and frontend)
2. Open browser to `http://localhost:3000`
3. Click on an event
4. Fill registration form
5. Check email for confirmation
6. Copy registration code from email
7. Go to admin panel
8. Paste code to verify attendance

### Sample Credentials (.env)

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=event_registration
DB_PASSWORD=your_password
DB_PORT=5432

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

FRONTEND_URL=http://localhost:3000
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in .env
- Ensure database exists: `psql -l`

### Email Not Sending
- Verify Gmail App Password is correct
- Check if 2-Step Verification is enabled
- Review console logs for errors

### CORS Errors
- Ensure backend CORS is enabled
- Check API_URL in frontend JS files matches backend port

## Security Notes

⚠️ **For Production:**
- Use environment-specific .env files
- Enable HTTPS
- Add rate limiting
- Implement admin authentication
- Use secure session management
- Sanitize all inputs
- Add CSRF protection

## License

MIT License - Free to use and modify

## Support

For issues or questions, please check:
- Console logs (browser and server)
- Database connection
- Email configuration
- Network requests in browser DevTools
```

---

## 🎯 Quick Start Commands

```bash
# 1. Setup Database
createdb event_registration
psql -d event_registration -f database/schema.sql

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm start

# 3. Frontend (new terminal)
cd frontend
python3 -m http.server 3000

# 4. Access Application
# Events: http://localhost:3000
# Admin: http://localhost:3000/admin.html
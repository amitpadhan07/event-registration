function validateRegistration(req, res, next) {
  const { name, email, phone, eventId } = req.body;

  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email is required');
  }

  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  if (!phone || !phoneRegex.test(phone)) {
    errors.push('Valid phone number is required (at least 10 digits)');
  }

  if (!eventId || isNaN(eventId)) {
    errors.push('Valid event ID is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  req.body.name = name.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.phone = phone.trim();

  next();
}

module.exports = { validateRegistration };
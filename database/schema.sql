-- Drop tables if they exist
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;

-- Create events table
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    venue VARCHAR(255) NOT NULL,
    max_seats INTEGER NOT NULL CHECK (max_seats > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_code VARCHAR(100) UNIQUE NOT NULL,
    attendance BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_registration UNIQUE (email, event_id)
);

-- Create indexes for better performance
CREATE INDEX idx_registrations_email ON registrations(email);
CREATE INDEX idx_registrations_code ON registrations(registration_code);
CREATE INDEX idx_registrations_event ON registrations(event_id);

-- Insert sample events
INSERT INTO events (title, event_date, event_time, venue, max_seats) VALUES
('Tech Conference 2026', '2026-02-15', '09:00:00', 'Convention Center Hall A', 500),
('Web Development Workshop', '2026-02-20', '14:00:00', 'Innovation Hub Room 301', 50),
('AI & Machine Learning Summit', '2026-03-05', '10:00:00', 'Grand Ballroom', 1000),
('Startup Networking Mixer', '2026-03-12', '18:00:00', 'Downtown Lounge', 150);
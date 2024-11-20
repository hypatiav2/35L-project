-- seed.sql
-- Adding sample users with placeholder profile pictures
INSERT INTO users (name, email, bio, profile_picture) VALUES
('Alice', 'alice@example.com', 'Loves hiking and reading', X'89504E470D0A1A0A...'), -- Replace x'...' with actual blob data
('Bob', 'bob@example.com', 'Enjoys coding and coffee', X'89504E470D0A1A0A...');

-- Adding availability data
INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '10:00', '12:00'),
(2, 'Tuesday', '14:00', '16:00');

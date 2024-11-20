-- seed.sql
-- Adding sample users with placeholder profile pictures
INSERT INTO users (name, email, bio) VALUES
('Alice', 'alice@example.com', 'Loves hiking and reading'), -- Replace x'...' with actual blob data
('Bob', 'bob@example.com', 'Enjoys coding and coffee');

-- Adding availability data
INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday', '10:00', '12:00'),
(2, 'Tuesday', '14:00', '16:00');

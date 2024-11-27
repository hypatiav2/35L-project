-- seed.sql
-- Adding sample users with placeholder profile pictures
INSERT INTO users (id, name, email, bio) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Alice', 'admin@gmail.com', 'Loves hiking and reading'), -- Replace x'...' with actual blob data
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'AJK', 'ajkim0630@gmail.com', 'Enjoys coding and coffee');

-- Adding availability data
INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Monday', '10:00', '12:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Tuesday', '14:00', '16:00');

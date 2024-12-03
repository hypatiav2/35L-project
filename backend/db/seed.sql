-- seed.sql
-- Adding sample users with placeholder profile pictures
INSERT INTO users (id, name, email, bio) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Alice', 'admin@gmail.com', 'Loves hiking and reading'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'AJK', 'ajkim0630@gmail.com', 'Enjoys coding and coffee'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Bob', 'admin2@gmail.com', 'Loves nothing'),
('0b0c0bac-6027-4174-a49a-d0c0dddcdce4', 'Bill', 'admin3@gmail.com', 'Loves everything'),
('516a48e3-9838-4534-abd2-8dba40cf87c6', 'Gertrude', 'admin4@gmail.com', 'Loves 35l');


-- Adding availability data
INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Monday', '10:00', '12:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Tuesday', '11:00', '13:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Wednesday', '8:00', '18:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Thursday', '18:00', '20:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Friday', '10:00', '12:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Saturday', '11:00', '13:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Monday', '11:30', '13:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Wednesday', '7:00', '13:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Friday', '11:30', '13:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Saturday', '10:00', '13:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Tuesday', '14:00', '16:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Wednesday', '14:00', '16:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Thursday', '20:00', '21:00');

INSERT INTO scheduled_dates (user1_id, user2_id, date_start, date_end) VALUES
("9e2d0dec-fec2-4cab-b742-bad2ea343490", "afd37871-3445-4162-9de0-8e3bfd144b98", "2023-11-27T15:04:05Z", "2023-11-27T15:50:05Z");
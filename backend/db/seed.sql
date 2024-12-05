-- seed.sql

-- Adding users with set vector values
INSERT INTO users (id, name, email, bio, vector) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Alice', 'admin@gmail.com', 'Loves hiking and reading', '[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Bob', 'admin1@gmail.com', 'Loves nothing', '[5, 2, 3, 2, 5, 5, 5, 4, 3, 3]'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'AJK', 'ajkim0630@gmail.com', 'Enjoys coding and coffee', '[2, 4, 3, 1, 2, 3, 5, 3, 4, 2]'),
('0b0c0bac-6027-4174-a49a-d0c0dddcdce4', 'Bill', 'admin3@gmail.com', 'Loves everything', '[1, 2, 3, 2, 1, 1, 3, 5, 4, 5]'),
('516a48e3-9838-4534-abd2-8dba40cf87c6', 'Gertrude', 'admin4@gmail.com', 'Loves 35l', '[5, 2, 3, 4, 5, 4, 3, 2, 4, 3]'),
('1c3d5e7f-89ab-4ced-b610-2d4a8f9c6e2f', 'Charlie', 'charlie@gmail.com', 'Tech enthusiast and gamer', '[1, 2, 1, 3, 3, 2, 4, 3, 4, 5]'),
('2f4b6d8c-7a9e-4fbd-aed3-3c6d9b8f7e3d', 'Diana', 'diana@gmail.com', 'Passionate about painting and photography', '[4, 5, 4, 3, 2, 1, 2, 3, 4, 5]'),
('3e5c7f9b-8adb-4cef-b731-4e7d9c0f8a1b', 'Eve', 'eve@gmail.com', 'Avid runner and fitness coach', '[5, 4, 4, 4, 3, 4, 2, 3, 5, 4]'),
('4f6d8b9a-9cbe-4fad-b842-5f9e0d2c8b4a', 'Frank', 'frank@gmail.com', 'Loves traveling and trying new foods', '[1, 2, 3, 2, 3, 2, 1, 2, 3, 4]'),
('5g7e9c1b-0daf-4ace-b953-6a0f1e3d9b5c', 'Grace', 'grace@gmail.com', 'Writer and cat lover', '[1, 2, 3, 2, 1, 1, 2, 3, 2, 1]'),
('6h8f0a2c-1ebf-4bdf-ba64-7b1f2f4eac6d', 'Hank', 'hank@gmail.com', 'Into woodworking and DIY projects', '[5, 4, 3, 3, 4, 3, 3, 5, 4, 3]'),
('7i9g1b3d-2fcg-4acf-bc75-8c2f3g5fbd7e', 'Ivy', 'ivy@gmail.com', 'Enjoys gardening and yoga', '[1, 4, 3, 2, 4, 2, 4, 1, 2, 1]'),
('8j0h2c4e-3gdg-4bdf-bd86-9d3f4h6fce8e', 'Jack', 'jack@gmail.com', 'Musician and movie buff', '[5, 4, 3, 4,3, 5, 5, 5, 1, 5]'),
('9k1i3d5f-4hef-4cdf-be97-ad4f5i7gdf9f', 'Kate', 'kate@gmail.com', 'Outdoor adventurer and coffee enthusiast', '[1, 1, 2, 2, 1, 1, 4, 4, 2, 3]'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Liam', 'liam@gmail.com', 'Tech enthusiast and avid gamer', '[5, 4, 5, 2, 5, 4, 5, 5, 5, 5]'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Emma', 'emma@gmail.com', 'Yoga instructor and dog lover', '[3, 4, 3, 2, 5, 4, 5, 1, 2, 5]'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Noah', 'noah@gmail.com', 'Travel blogger and photographer', '[1, 2, 3, 1, 2, 1, 4, 5, 3, 4]'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Olivia', 'olivia@gmail.com', 'Food critic and aspiring chef', '[1, 2, 1, 1, 4, 1, 2, 3, 1, 2]'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Ethan', 'ethan@gmail.com', 'Fitness coach and outdoor explorer', '[5, 4, 5, 3, 4, 2, 4, 5, 3, 4]');




-- Adding availability data
INSERT INTO availability (user_id, day_of_week, start_time, end_time) VALUES
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Monday', '10:00:00', '12:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Tuesday', '11:00:00', '13:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Wednesday', '11:00:00', '18:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Thursday', '18:00:00', '20:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Friday', '10:00:00', '12:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Saturday', '11:00:00', '13:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Monday', '11:30:00', '13:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Wednesday', '08:00:00', '13:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Friday', '11:30:00', '13:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Saturday', '09:00:00', '13:00:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Tuesday', '14:00:00', '16:00:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Wednesday', '14:00:00', '16:00:00'),
('721d4cbf-4283-40f3-89d8-e65f5d52fbbf', 'Thursday', '20:00:00', '21:00:00'),

-- Alice
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Monday', '10:00:00', '12:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Wednesday', '14:00:00', '16:00:00'),
('afd37871-3445-4162-9de0-8e3bfd144b98', 'Friday', '09:00:00', '11:00:00'),

-- Bob
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Tuesday', '13:00:00', '15:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Thursday', '16:00:00', '18:00:00'),
('9e2d0dec-fec2-4cab-b742-bad2ea343490', 'Saturday', '10:00:00', '12:00:00'),

-- Charlie
('1c3d5e7f-89ab-4ced-b610-2d4a8f9c6e2f', 'Monday', '09:00:00', '11:00:00'),
('1c3d5e7f-89ab-4ced-b610-2d4a8f9c6e2f', 'Wednesday', '13:00:00', '15:00:00'),
('1c3d5e7f-89ab-4ced-b610-2d4a8f9c6e2f', 'Friday', '14:00:00', '16:00:00'),

-- Diana
('2f4b6d8c-7a9e-4fbd-aed3-3c6d9b8f7e3d', 'Tuesday', '09:30:00', '11:30:00'),
('2f4b6d8c-7a9e-4fbd-aed3-3c6d9b8f7e3d', 'Thursday', '12:00:00', '14:00:00'),
('2f4b6d8c-7a9e-4fbd-aed3-3c6d9b8f7e3d', 'Saturday', '15:00:00', '17:00:00'),

-- Eve
('3e5c7f9b-8adb-4cef-b731-4e7d9c0f8a1b', 'Monday', '07:00:00', '09:00:00'),
('3e5c7f9b-8adb-4cef-b731-4e7d9c0f8a1b', 'Thursday', '18:00:00', '20:00:00'),
('3e5c7f9b-8adb-4cef-b731-4e7d9c0f8a1b', 'Sunday', '08:00:00', '10:00:00'),

-- Frank
('4f6d8b9a-9cbe-4fad-b842-5f9e0d2c8b4a', 'Monday', '10:00:00', '12:00:00'),
('4f6d8b9a-9cbe-4fad-b842-5f9e0d2c8b4a', 'Wednesday', '14:00:00', '16:00:00'),
('4f6d8b9a-9cbe-4fad-b842-5f9e0d2c8b4a', 'Friday', '09:00:00', '11:00:00'),

-- Grace
('5g7e9c1b-0daf-4ace-b953-6a0f1e3d9b5c', 'Tuesday', '11:00:00', '13:00:00'),
('5g7e9c1b-0daf-4ace-b953-6a0f1e3d9b5c', 'Thursday', '09:00:00', '11:00:00'),
('5g7e9c1b-0daf-4ace-b953-6a0f1e3d9b5c', 'Saturday', '14:00:00', '16:00:00'),

-- Hank
('6h8f0a2c-1ebf-4bdf-ba64-7b1f2f4eac6d', 'Monday', '08:00:00', '10:00:00'),
('6h8f0a2c-1ebf-4bdf-ba64-7b1f2f4eac6d', 'Wednesday', '13:00:00', '15:00:00'),
('6h8f0a2c-1ebf-4bdf-ba64-7b1f2f4eac6d', 'Friday', '16:00:00', '18:00:00'),

-- Ivy
('7i9g1b3d-2fcg-4acf-bc75-8c2f3g5fbd7e', 'Tuesday', '12:00:00', '14:00:00'),
('7i9g1b3d-2fcg-4acf-bc75-8c2f3g5fbd7e', 'Thursday', '10:00:00', '12:00:00'),
('7i9g1b3d-2fcg-4acf-bc75-8c2f3g5fbd7e', 'Saturday', '15:00:00', '17:00:00'),

-- Jack
('8j0h2c4e-3gdg-4bdf-bd86-9d3f4h6fce8e', 'Monday', '14:00:00', '16:00:00'),
('8j0h2c4e-3gdg-4bdf-bd86-9d3f4h6fce8e', 'Wednesday', '09:00:00', '11:00:00'),
('8j0h2c4e-3gdg-4bdf-bd86-9d3f4h6fce8e', 'Friday', '13:00:00', '15:00:00'),

-- Kate
('9k1i3d5f-4hef-4cdf-be97-ad4f5i7gdf9f', 'Tuesday', '10:30:00', '12:30:00'),
('9k1i3d5f-4hef-4cdf-be97-ad4f5i7gdf9f', 'Thursday', '15:00:00', '17:00:00'),
('9k1i3d5f-4hef-4cdf-be97-ad4f5i7gdf9f', 'Sunday', '09:00:00', '11:00:00'),

-- Liam
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Monday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Tuesday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Wednesday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Thursday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Friday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Saturday', '00:00:00', '23:59:59'),
('10a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5', 'Sunday', '00:00:00', '23:59:59'),

-- Emma
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Monday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Tuesday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Wednesday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Thursday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Friday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Saturday', '00:00:00', '23:59:59'),
('11b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6', 'Sunday', '00:00:00', '23:59:59'),

-- Noah
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Monday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Tuesday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Wednesday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Thursday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Friday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Saturday', '00:00:00', '23:59:59'),
('12c3d4e5-f6g7-h8i9-j0k1-l2m3n4o5p6q7', 'Sunday', '00:00:00', '23:59:59'),

-- Olivia
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Monday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Tuesday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Wednesday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Thursday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Friday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Saturday', '00:00:00', '23:59:59'),
('13d4e5f6-g7h8-i9j0-k1l2-m3n4o5p6q7r8', 'Sunday', '00:00:00', '23:59:59'),

-- Ethan
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Monday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Tuesday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Wednesday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Thursday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Friday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Saturday', '00:00:00', '23:59:59'),
('14e5f6g7-h8i9-j0k1-l2m3-n4o5p6q7r8s9', 'Sunday', '00:00:00', '23:59:59');


INSERT INTO scheduled_dates (user1_id, user2_id, date_start, date_end) VALUES
("9e2d0dec-fec2-4cab-b742-bad2ea343490", "afd37871-3445-4162-9de0-8e3bfd144b98", "2023-11-27T15:04:05Z", "2023-11-27T15:50:05Z");
-- schema.sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    bio TEXT,
    vector JSON DEFAULT '[3,3,3,3,3,3,3,3,3,3]',
    profile_picture BLOB  -- New column for storing profile pictures
);

CREATE TABLE availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    day_of_week TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    similarity_score REAL,
    FOREIGN KEY(user1_id) REFERENCES users(id),
    FOREIGN KEY(user2_id) REFERENCES users(id)
);

CREATE TABLE scheduled_dates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    date_start TEXT NOT NULL, -- we want this in ISO 8601 format
    date_end TEXT NOT NULL,   -- same here
    status TEXT DEFAULT "pending", -- "pending", "confirmed", "rejected"
    FOREIGN KEY(user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(user2_id) REFERENCES users(id) ON DELETE CASCADE
);

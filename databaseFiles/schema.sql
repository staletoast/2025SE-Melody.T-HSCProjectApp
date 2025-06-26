-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- Creatures table
CREATE TABLE IF NOT EXISTS creatures (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT NOT NULL
);

-- UserCreatures table (tracks which creatures a user has unlocked)
CREATE TABLE IF NOT EXISTS user_creatures (
    user_id INTEGER,
    creature_id INTEGER,
    PRIMARY KEY (user_id, creature_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (creature_id) REFERENCES creatures(id)
);

-- StudySessions table
CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    duration INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

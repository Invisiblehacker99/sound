-- Drop existing tables
DROP TABLE IF EXISTS playlist_songs;
DROP TABLE IF EXISTS playlists;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS songs;
DROP TABLE IF EXISTS users;

-- Create tables
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    artist VARCHAR(255),
    file_path VARCHAR(255),
    thumbnail VARCHAR(255)
);

CREATE TABLE likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    song_id INT,
    liked BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
);

CREATE TABLE playlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    name VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE playlist_songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playlist_id INT,
    song_id INT,
    FOREIGN KEY (playlist_id) REFERENCES playlists(id),
    FOREIGN KEY (song_id) REFERENCES songs(id)
);
USE music_player_db;
SHOW TABLES;
DESCRIBE users;
DESCRIBE songs;
DESCRIBE likes;
DESCRIBE playlists;
DESCRIBE playlist_songs;

SELECT * FROM users;
INSERT INTO users (username, password) VALUES ('newuser', 'newpassword');
SELECT * FROM users;
INSERT INTO playlists (user_id, name, thumbnail) VALUES (1, 'My Favorite Songs', 'path/to/thumbnail.jpg');







const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Ensure this is at the top

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'music_player_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// JWT Secret keys from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
  
    if (!token) {
      console.log('No token provided');
      return; // Do nothing and terminate request
    }
  
    console.log('Received Token:', token); // Log token for debugging
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('Token verification error:', err);
        return; // Do nothing and terminate request
      }
  
      console.log('Decoded User Data:', decoded); // Log user data for debugging
      req.userData = decoded;
      next();
    });
  }
  

// Register a new user
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const [existingUser] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into database
    await db.promise().query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login user
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username exists
    const [user] = await db.promise().query('SELECT * FROM users WHERE username = ?', [username]);
    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user[0].password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user[0].id, username: user[0].username }, JWT_SECRET, { expiresIn: '1h' });

    // Generate refresh token
    const refreshToken = jwt.sign({ userId: user[0].id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, refreshToken });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Refresh access token
app.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

    // Generate a new access token
    const newToken = jwt.sign({ userId: decoded.userId }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ token: newToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Example protected route
app.get('/profile', verifyToken, (req, res) => {
    if (!req.userData) {
      // No user data means unauthorized
      return; // Terminate without sending response
    }
  
    res.json({ message: 'This is a protected route', user: req.userData });
  });
  
// Create a new playlist
app.post('/playlist', verifyToken, async (req, res) => {
    if (!req.userData) {
      return; // Terminate without sending response
    }
  
    const { name, thumbnail } = req.body;
    const userId = req.userData.userId;
  
    try {
      await db.promise().query(
        'INSERT INTO playlists (user_id, name, thumbnail) VALUES (?, ?, ?)', [userId, name, thumbnail]
      );
  
      res.status(201).json({ message: 'Playlist created' });
    } catch (error) {
      console.error('Error creating playlist:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

// Add song to playlist
app.post('/playlist/:playlistId/song/:songId', verifyToken, async (req, res) => {
  const { playlistId, songId } = req.params;

  try {
    await db.promise().query(
      'INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)', [playlistId, songId]
    );

    res.status(200).json({ message: 'Song added to playlist' });
  } catch (error) {
    console.error('Error adding song to playlist:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get playlists of a user
app.get('/playlists', verifyToken, async (req, res) => {
  const userId = req.userData.userId;

  try {
    const [playlists] = await db.promise().query(
      'SELECT * FROM playlists WHERE user_id = ?', [userId]
    );
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get songs in a playlist
app.get('/playlist/:playlistId/songs', verifyToken, async (req, res) => {
  const { playlistId } = req.params;

  try {
    const [songs] = await db.promise().query(
      'SELECT s.* FROM playlist_songs ps JOIN songs s ON ps.song_id = s.id WHERE ps.playlist_id = ?', [playlistId]
    );
    res.status(200).json(songs);
  } catch (error) {
    console.error('Error fetching playlist songs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve the index.html file at the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

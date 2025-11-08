// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { sql, pool } = require('./db'); // Use your db.js from previous step

const app = express();
app.use(express.json());

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const poolConn = await pool;
    await poolConn.request()
      .input('username', sql.NVarChar, username)
      .input('password', sql.NVarChar, hashedPassword)
      .query('INSERT INTO Users (username, password) VALUES (@username, @password)');
    res.json({ message: 'User registered successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
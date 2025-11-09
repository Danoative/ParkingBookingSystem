// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { sql, pool } = require('./db'); //get db.js

const app = express();
app.use(express.json());

// User Register System here

//  User Loggi System here

// Admin Register System

// Admin Login System

// Booking System

// Parking Lot System

// This is to test the database if it's connected to MSSQL Server Express
app.get('/api/test-db', async (req, res) => {
  try {
    const poolConn = await pool; // from your db.js
    const result = await poolConn.request().query('SELECT TOP 1 * FROM Admins'); // Change admins to what table in the database's table 
    res.json({
      connected: true,
      row: result.recordset[0] || null
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: err.message
    });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
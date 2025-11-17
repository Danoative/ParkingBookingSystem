
// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, connectDB } = require('./db'); // from the mysql2-based db.js
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// optional: verify connection on startup
connectDB().catch(() => process.exit(1));

// User Register System here

//  User Loggi System here

// Admin Register System

// Admin Login System

// Booking System
app.post('/api/booking', async (req, res) => {
  const {
    UserID,
    AreaID,
    SlotNumber,
    FirstName,
    LastName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime
  } = req.body;

  try {
    const poolConn = await pool; // assuming pooled connection from './db'
    
    const startDate = new Date(StartTime);
    const endDate = new Date(EndTime);

    await poolConn.request()
      .input('UserID', sql.Int, UserID)
      .input('AreaID', sql.Int, AreaID)
      .input('SlotNumber', sql.Int, SlotNumber)
      .input('FirstName', sql.NVarChar(100), FirstName)
      .input('LastName', sql.NVarChar(100), LastName)
      .input('Email', sql.NVarChar(255), Email)
      .input('Phone', sql.NVarChar(50), Phone)
      .input('UserAddress', sql.NVarChar(255), UserAddress)
      .input('StartTime', sql.DateTime, StartTime)
      .input('EndTime', sql.DateTime, EndTime)
      .query(`
        INSERT INTO Booking
        (UserID, AreaID, SlotNumber, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime)
        VALUES (@UserID, @AreaID, @SlotNumber, @FirstName, @LastName, @Email, @Phone, @UserAddress, @StartTime, @EndTime)
      `);

    res.json({ success: true, message: "Booking successfully created.", received: req.body });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Parking Lot System

// This is to test the database if it's connected to MySQL Server
app.get('/api/test-db', async (req, res) => {
  try {
    // Example table: admins (rename to your actual table if different)
    const [rows] = await pool.query('SELECT * FROM admins LIMIT 1');
    res.json({
      connected: true,
      row: rows[0] || null,
    });
  } catch (err) {
    res.status(500).json({
      connected: false,
      error: err.message,
    });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
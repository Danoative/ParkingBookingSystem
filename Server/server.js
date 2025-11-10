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
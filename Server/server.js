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
    userID,
    areaID,
    slotNumber,
    firstName,
    lastName,
    email,
    phone,
    userAddress,
    startTime,
    endTime
    // status is usually optional
  } = req.body;

  try {
    await sql.connect(config);
    const request = new sql.Request();

    request.input('UserID', sql.Int, userID);
    request.input('AreaID', sql.Int, areaID);
    request.input('SlotNumber', sql.Int, slotNumber);
    request.input('FirstName', sql.NVarChar(100), firstName);
    request.input('LastName', sql.NVarChar(100), lastName);
    request.input('Email', sql.NVarChar(255), email);
    request.input('Phone', sql.NVarChar(50), phone);
    request.input('UserAddress', sql.NVarChar(255), userAddress);
    request.input('StartTime', sql.DateTime, startTime);
    request.input('EndTime', sql.DateTime, endTime);
    // Don't pass Status or CreatedAt unless you need to override the default

    const result = await request.query(`
      INSERT INTO Booking
      (UserID, AreaID, SlotNumber, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime)
      VALUES (@UserID, @AreaID, @SlotNumber, @FirstName, @LastName, @Email, @Phone, @UserAddress, @StartTime, @EndTime)
    `);

    res.json({ success: true, message: 'Booking successfully created.' });
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
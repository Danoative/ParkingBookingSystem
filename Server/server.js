const express = require('express');
const bcrypt = require('bcryptjs');
const { pool, connectDB } = require('./db'); // mysql2-based db.js
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

connectDB().catch(() => process.exit(1));

// Dashboard Statistics
app.get('/api/dashboard-stats', async (req, res) => {
  try {
    const [totalUsersRows] = await pool.query('SELECT COUNT(UserID) AS totalUsers FROM Users');
    const [availableSlotsRows] = await pool.query("SELECT COUNT(SlotID) AS availableSlots FROM ParkingSlot WHERE SlotStatus = 'available'");
    const [occupiedSlotsRows] = await pool.query("SELECT COUNT(SlotID) AS occupiedSlots FROM ParkingSlot WHERE SlotStatus = 'not available'");
    const [adminRows] = await pool.query("SELECT COUNT(UserID) AS admins FROM Users WHERE Role = 'ADMIN'");

    res.json({
      totalUsers: totalUsersRows[0].totalUsers,
      availableSlots: availableSlotsRows[0].availableSlots,
      occupiedSlots: occupiedSlotsRows[0].occupiedSlots,
      admins: adminRows[0].admins
    });
  } catch (err) {
    res.status(500).send('Error fetching dashboard data');
  }
});

// Get area info
app.get('/api/area/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT AreaID, ParkName, ParkingLocation, TotalSlots, AvailableSlots, PricePerHour FROM ParkingAreas WHERE AreaID = ?',
      [req.params.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get slots for area (no SlotNum, uses SlotID and SlotLocation)
app.get('/api/area/:id/slots', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT SlotID, SlotLocation, SlotStatus, CurrentVehID FROM ParkingSlot WHERE AreaID = ? ORDER BY SlotID',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book a slot (assign vehicle to CurrentVehID, set to not available)
app.post('/api/slot/:slotId/book', async (req, res) => {
  const { vehicleId } = req.body;
  try {
    await pool.query(
      "UPDATE ParkingSlot SET CurrentVehID = ?, SlotStatus = 'not available' WHERE SlotID = ?",
      [vehicleId, req.params.slotId]
    );
    res.json({ success: true, message: "Slot booked successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unbook a slot (remove vehicle, set to available)
app.post('/api/slot/:slotId/unbook', async (req, res) => {
  try {
    await pool.query(
      "UPDATE ParkingSlot SET CurrentVehID = NULL, SlotStatus = 'available' WHERE SlotID = ?",
      [req.params.slotId]
    );
    res.json({ success: true, message: "Slot unbooked successfully." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Example booking system (add a booking record, you should create relevant Booking table and logic)
app.post('/api/booking', async (req, res) => {
  const {
    UserID,
    AreaID,
    SlotID,
    FullName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime,
    VehicleID // Add this for correct reference
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO Booking
      (UserID, AreaID, SlotID, FullName, Email, Phone, UserAddress, StartTime, EndTime, VehicleID)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [UserID, AreaID, SlotID, FullName, Email, Phone, UserAddress, StartTime, EndTime, VehicleID]
    );
    // Also update the slot to book it
    await pool.query(
      "UPDATE ParkingSlot SET CurrentVehID = ?, SlotStatus = 'not available' WHERE SlotID = ?",
      [VehicleID, SlotID]
    );
    res.json({ success: true, message: "Booking successfully created." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Test users table
app.get('/api/users', async (req, res) => {
  const [rows] = await pool.query('SELECT UserID, Username, PassWordHash, Email, Address, Role FROM Users');
  res.json(rows);
});

// API for Users Section
app.post('/api/users', async (req, res) => {
  const { Username, Email, Password, Address, Role } = req.body;
  const hash = await bcrypt.hash(Password, 10);
  await pool.query('INSERT INTO Users (Username, Email, PasswordHash, Address, Role) VALUES (?, ?, ?, ?, ?)',
    [Username, Email, hash, Address, Role]);
  res.status(201).json({ success: true });
});

app.put('/api/users/:id', async (req, res) => {
  const { Username, Email, Address, Role, Password } = req.body;
  let query = 'UPDATE Users SET Username=?, Email=?, Address=?, Role=?';
  let params = [Username, Email, Address, Role, req.params.id];
  if (Password) {
    const hash = await bcrypt.hash(Password, 10);
    query = 'UPDATE Users SET Username=?, Email=?, Address=?, Role=?, PasswordHash=? WHERE UserID=?';
    params = [Username, Email, Address, Role, hash, req.params.id];
  } else {
    query += ' WHERE UserID=?';
  }
  await pool.query(query, params);
  res.json({ success: true });
});

app.delete('/api/users/:id', async (req, res) => {
  await pool.query('DELETE FROM Users WHERE UserID=?', [req.params.id]);
  res.json({ success: true });
});
// 

// DB test endpoints remain the same
app.get('/api/test-db', async (req, res) => {
  try {
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
app.get('/api/users/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT UserID, username, email, role FROM Users ORDER BY UserID DESC LIMIT 1');
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));

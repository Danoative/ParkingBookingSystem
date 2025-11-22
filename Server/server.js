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

// Test Booking 

app.post('/api/booking', async (req, res) => {
  const bookingData = req.body;
  bookingData.UserID = 1;
  bookingData.AreaID = 1;
  bookingData.SlotID = 1;
  bookingData.VehicleID = 1;
  const {
    UserID,
    AreaID,
    SlotID,
    VehicleID, // Vehicle to assign to the slot
    FirstName,
    LastName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime,
    TotalCost, // Pass from frontend, or calculate before booking/payment
    PayMethod // e.g. 'Online Banking', 'Credit Card', 'Pay In Cash'
  } = req.body;

  // Default status fields
  const BookingStat = 'PENDING';
  const PayStat = 'Unpaid';

  // MySQL transaction for atomicity
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Insert booking
    const [bookingResult] = await conn.query(
      `INSERT INTO Booking
      (UserID, AreaID, SlotID, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime, BookingStat)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [UserID, AreaID, SlotID, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime, BookingStat]
    );
    const BookingID = bookingResult.insertId; // Get inserted booking ID

    // 2. Update parking slot CurrentVehID and status
    await conn.query(
      "UPDATE ParkingSlot SET CurrentVehID = ?, SlotStatus = 'not available' WHERE SlotID = ?",
      [VehicleID, SlotID]
    );

    // 3. Insert payment record
    await conn.query(
      `INSERT INTO Payment
      (UserID, BookingID, TotalCost, PayStat, PayMethod)
      VALUES (?, ?, ?, ?, ?)`,
      [UserID, BookingID, TotalCost, PayStat, PayMethod]
    );

    await conn.commit();
    conn.release();

    res.json({ success: true, BookingID, message: "Booking and payment registered, awaiting payment." });
  } catch (err) {
    await conn.rollback();
    conn.release();
    res.status(500).json({ success: false, error: err.message });
  }
});
// 
// Convert '2025-11-04T21:00' to '2025-11-04 21:00:00'
function normalizeDateTime(htmlInput) {
  if (!htmlInput) return null;
  // Handles 'YYYY-MM-DDTHH:mm' -> 'YYYY-MM-DD HH:mm:00'
  return htmlInput.replace('T', ' ') + (htmlInput.length === 16 ? ':00' : '');
}
// 
// Admin edits booking + payment info in one call
app.put('/api/bookings/:id/admin-edit', async (req, res) => {
  
  let { EndTime, BookingStat, PayStat } = req.body;
  const BookingID = req.params.id;

  if (EndTime && EndTime.includes('T')) EndTime = normalizeDateTime(EndTime); // Convert to proper MySQL DATETIME
  
  const conn = await pool.getConnection();
  try {
    // Fetch StartTime
    const [[bookingRow]] = await conn.query("SELECT StartTime FROM Booking WHERE BookingID=?", [BookingID]);
    if (!bookingRow) throw new Error("Booking not found.");

    // Compare
    if (new Date(EndTime) <= new Date(bookingRow.StartTime)) {
      throw new Error("EndTime must be after StartTime!");
    }

    await conn.beginTransaction();
    await conn.query(
      `UPDATE Booking SET EndTime = ?, BookingStat = ? WHERE BookingID = ?`,
      [EndTime, BookingStat, BookingID]
    );
    await conn.query(
      `UPDATE Payment SET PayStat=? WHERE BookingID=?`,
      [PayStat, BookingID]
    );
    
    // If Paid, set occupied
    if(PayStat === 'Paid') {
      const [rows] = await conn.query('SELECT SlotID, VehicleID FROM Booking WHERE BookingID=?', [req.params.id]);
      if(rows.length) {
        const { SlotID, VehicleID } = rows[0];
        await conn.query("UPDATE ParkingSlot SET SlotStatus='not available', CurrentVehID=? WHERE SlotID=?", [VehicleID || 1, SlotID]);
      }
    }
    await conn.commit();
    conn.release();
    res.json({success:true});
  } catch(err) {
    await conn.rollback();
    conn.release();
    console.error('Admin booking edit error:', err); 
    res.status(400).json({success:false, error: err.message});
  }
});


// Test users table
app.get('/api/users', async (req, res) => {
  const [rows] = await pool.query('SELECT UserID, Username, PasswordHash, Email, Address, Role FROM Users');
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



// Bookin Section (Admin Dashboard)
// Get all bookings with joined payment info
app.get('/api/bookings', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, p.PayStat, p.PayMethod, p.TotalCost
    FROM Booking b
    LEFT JOIN Payment p ON b.BookingID = p.BookingID
    ORDER BY b.BookingID DESC
  `);
  res.json(rows);
});

// Get one booking detail
app.get('/api/bookings/:id', async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, p.PayStat, p.PayMethod, p.TotalCost
    FROM Booking b
    LEFT JOIN Payment p ON b.BookingID = p.BookingID
    WHERE b.BookingID = ?
  `, [req.params.id]);
  res.json(rows[0] || {});
});

// Edit booking status/endTime
app.put('/api/bookings/:id', async (req, res) => {
  const { EndTime, BookingStat } = req.body;
  await pool.query(`UPDATE Booking SET EndTime = ?, BookingStat = ? WHERE BookingID = ?`, [EndTime, BookingStat, req.params.id]);
  res.json({success:true});
});

// Admin updates payment status
app.put('/api/bookings/:id/payment', async (req, res) => {
  const { PayStat } = req.body;
  // Update Payment table
  await pool.query(`UPDATE Payment SET PayStat=? WHERE BookingID=?`, [PayStat, req.params.id]);
  // If Paid, occupy slot
  if(PayStat === 'Paid') {
    // Assuming you want to occupy slot as well:
    const [rows] = await pool.query('SELECT SlotID, VehicleID FROM Booking WHERE BookingID=?', [req.params.id]);
    if(rows.length) {
      const { SlotID, VehicleID } = rows[0];
      await pool.query("UPDATE ParkingSlot SET SlotStatus='not available', CurrentVehID=? WHERE SlotID=?", [VehicleID || 1, SlotID]);
    }
  }
  res.json({success:true});
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

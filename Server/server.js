
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

// Insert in your server.js (near other routes)
const { requireAuth, requireAdmin } = require('./authz'); // adjust path as needed
// List Users for UI
// GET /api/users -> [{id, table, username, email, role}]
app.get('/api/users', requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT AdminID AS AdminID, 'admin' AS Admins, username, email, 'admin' AS role
      FROM admin
      UNION ALL
      SELECT UserID AS UserId, 'user' AS users, username, email, 'customer' AS role
      FROM Users
      ORDER BY role, username
      `
    );
    // normalize 'table' field name for the client
    res.json(rows.map(r => ({ ...r, table: r.table_name })));
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add User (admin)
app.post('/api/users', requireAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password || !['admin','customer'].includes(role)) {
      return res.status(400).json({ error: 'username, email, password, role required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);

    if (role === 'admin') {
      await pool.query(
        'INSERT INTO admin (username, email, password_hash) VALUES (?, ?, ?)',
        [username.trim(), email.trim(), passwordHash]
      );
    } else {
      await pool.query(
        'INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, "customer")',
        [username.trim(), email.trim(), passwordHash]
      );
    }
    res.status(201).json({ message: 'User created' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email exists' });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
// PUT /api/users/:table/:id  table in ['admin','users']
app.put('/api/users/:table/:id', requireAdmin, async (req, res) => {
  const table = req.params.table; // 'admin' or 'users'
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  if (!['admin','users'].includes(table)) return res.status(400).json({ error: 'Invalid table' });

  // Prevent editing own account
  if (req.user?.table === table && req.user?.id === id) {
    return res.status(403).json({ error: 'Admins cannot edit their own account here' });
  }

  const { username, email, password } = req.body || {};
  const fields = [];
  const params = [];

  if (typeof username === 'string') { fields.push('username = ?'); params.push(username.trim()); }
  if (typeof email === 'string')    { fields.push('email = ?');    params.push(email.trim()); }
  if (typeof password === 'string') {
    const hash = await bcrypt.hash(password, 10);
    fields.push('password_hash = ?'); params.push(hash);
  }
  if (!fields.length) return res.status(400).json({ error: 'No valid fields to update' });

  const idCol = table === 'admin' ? 'AdminID' : 'UserID';
  try {
    const [result] = await pool.query(
      `UPDATE ${table === 'admin' ? 'admin' : 'Users'} SET ${fields.join(', ')} WHERE ${idCol} = ?`,
      [...params, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated' });
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Username or email exists' });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete User (Only Admin)
app.delete('/api/users/:table/:id', requireAdmin, async (req, res) => {
  const table = req.params.table; // 'admin' or 'users'
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
  if (!['admin','users'].includes(table)) return res.status(400).json({ error: 'Invalid table' });

  // Prevent self-delete
  if (req.user?.table === table && req.user?.id === id) {
    return res.status(403).json({ error: 'Admins cannot delete their own account' });
  }

  // Never allow deleting admins
  if (table === 'admin') {
    return res.status(403).json({ error: 'Cannot delete admin accounts' });
  }

  const idCol = 'UserID';
  try {
    const [[exists]] = await pool.query('SELECT UserID FROM Users WHERE UserID = ?', [id]);
    if (!exists) return res.status(404).json({ error: 'User not found' });

    const [result] = await pool.query('DELETE FROM Users WHERE UserID = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});


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
    FulltName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime
  } = req.body;

  try {
    const poolConn = await pool;

    await poolConn.request()
      .input('UserID', sql.Int, UserID)
      .input('AreaID', sql.Int, AreaID)
      .input('SlotNumber', sql.Int, SlotNumber)
      .input('FullName', sql.NVarChar(100), FulltName)
      .input('Email', sql.NVarChar(255), Email)
      .input('Phone', sql.NVarChar(50), Phone)
      .input('UserAddress', sql.NVarChar(255), UserAddress)
      .input('StartTime', sql.DateTime, StartTime)
      .input('EndTime', sql.DateTime, EndTime)
      .query(`
        INSERT INTO Booking
        (UserID, AreaID, SlotNumber, FulltName, Email, Phone, UserAddress, StartTime, EndTime)
        VALUES (@UserID, @AreaID, @SlotNumber, @FullName, @Email, @Phone, @UserAddress, @StartTime, @EndTime)
      `);

    res.json({ success: true, message: "Booking successfully created." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Edit Booking
app.put('/api/bookings/:id', async (req, res) => {
  const { EndTime, BookingStat } = req.body;
  const { id } = req.params;

  try {
    const poolConn = await pool;

    await poolConn.request()
      .input('BookingID', sql.Int, id)
      .input('EndTime', sql.DateTime, EndTime)
      .input('BookingStat', sql.NVarChar(20), BookingStat)
      .query(`
        UPDATE Booking
        SET EndTime = @EndTime, BookingStat = @BookingStat
        WHERE BookingID = @BookingID
      `);

    res.json({ success: true, message: `Booking ${id} has been updated.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
// Delete Booking
app.delete('/api/bookings/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const poolConn = await pool;

    await poolConn.request()
      .input('BookingID', sql.Int, id)
      .query(`DELETE FROM Booking WHERE BookingID = @BookingID`);

    res.json({ success: true, message: `Booking ${id} deleted successfully.` });
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
// This is to test the database if the users table is recognized
app.get('/api/users/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT UserID, username, email, role FROM Users ORDER BY UserID DESC LIMIT 1');
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
// Simple test
app.get('/api/users/test', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT UserID, username, password, email, role FROM Users ORDER BY UserID DESC LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
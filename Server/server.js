const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');

const path = require('path');
const srcDir = path.join(__dirname,  '..', 'src');

const { pool, connectDB } = require('./db');

const app = express();

//  CORE MIDDLEWARE 
app.use(express.json());

app.use(cors({
  origin: 'http://localhost:8080',
  credentials: true
}));

// Session 
app.use(session({
  secret: 'your_super_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

connectDB().catch(() => process.exit(1));

// ====== AUTH / ROLE MIDDLEWARE ======
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, error: 'Not logged in' });
  }
  next();
}

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.session.userId || !allowed.includes(req.session.role)) {
      return res.status(403).send('Forbidden');
    }
    next();
  };
}

// public admin login/register pages
app.get('/AdminDash/authentication-login.html', (req, res) => {
  res.sendFile(path.join(srcDir, 'AdminDash', 'authentication-login.html'));
});
app.get('/AdminDash/authentication-register.html', (req, res) => {
  res.sendFile(path.join(srcDir, 'AdminDash', 'authentication-register.html'));
});

// AdminDash: only ADMIN
app.use(
  '/AdminDash',
  requireRole('ADMIN'),
  express.static(path.join(srcDir, 'AdminDash'))
);

// BookingPage: ADMIN or CUSTOMER
app.use(
  '/BookingPage',
  requireRole(['ADMIN', 'CUSTOMER']),
  express.static(path.join(srcDir, 'BookingPage'))
);

// Root redirect based on role
app.get('/', requireLogin, (req, res) => {
  if (req.session.role === 'ADMIN') {
    return res.redirect('/AdminDash/index.html');
  }
  if (req.session.role === 'CUSTOMER') {
    return res.redirect('/BookingPage/index.html');
  }
  res.status(403).json({ message: 'Unknown role' });
});

// ================= AUTH ROUTES ================

app.get('/auth/me', (req, res) => {
  if (!req.session.userId) {
    return res.json({ loggedIn: false });
  }

  return res.json({
    loggedIn: true,
    userId:   req.session.userId,
    role:     req.session.role || null,
    username: req.session.username || null
  });
});
// Admin register: always ADMIN, then redirect back to login with message
app.post('/register', async (req, res) => {
  console.log('REGISTER body:', req.body);

  const { username, email, password, role: requestedRole } = req.body;

  if (!username || !email || !password) {
    console.log('Missing fields, returning 400');
    return res.status(400).send('Missing fields');
  }

  try {
    // 1) Check if email exists
    const [existing] = await pool.query(
      'SELECT UserID, Email FROM Users WHERE Email = ?',
      [email]
    );
    console.log('Existing rows for email:', existing);

    if (existing.length > 0) {
      return res.status(400).send('Email already registered');
    }

    // 2) Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Role: only allow known values, default to ADMIN
    const allowedRoles = ['ADMIN', 'CUSTOMER', 'MANAGER'];
    const role = allowedRoles.includes(requestedRole) ? requestedRole : 'ADMIN';
    console.log('Final role to insert:', role);

    // 4) Insert user
    const [result] = await pool.query(
      `INSERT INTO Users (Username, Email, PasswordHash, Address, Role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, 'N/A', role]
    );
    console.log('Insert result:', result);

    const newUserId = result.insertId;

    // 5) Create session
    req.session.userId = newUserId;
    req.session.role = role;

    // 6) Redirect back to admin login with success message
    // If you are using redirects (not JSON) with fetch, you can simply send text instead:
    // res.send('OK');
res.json({
  success: true,
  redirect: '../AdminDash/authentication-login.html?msg=registered_admin_success'
});
  } catch (err) {
    console.error('Register error:', err);
    // Send the message so you can see actual DB error in browser too
    return res.status(500).send(err.message || 'Server error');
  }
});

// Login route for both AdminDash and BookingPage
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing email or password');
  }

  try {
    const [rows] = await pool.query(
      'SELECT UserID, PasswordHash, Role FROM Users WHERE Email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).send('Invalid email or password');
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
      return res.status(400).send('Invalid email or password');
    }

    // set session
    req.session.userId = user.UserID;
    req.session.role = user.Role;

    // redirect by role
    if (user.Role === 'ADMIN') {
      return res.json({
        success: true,
        role: 'ADMIN',
        redirect: 'http://localhost:8080/src/AdminDash/index.html'
      });
    }
    if (user.Role === 'CUSTOMER') {
      return res.json({
        success: true,
        role: 'CUSTOMER',
        redirect: 'http://localhost:8080/src/BookingPage/index.html'
      });
    }

    // fallback if DB has unexpected role
    return res.json({
      success: true,
      role: user.Role,
      redirect: 'http://localhost:8080/'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Customer register: creates CUSTOMER user + vehicle
app.post('/customer/register', async (req, res) => {
  const { username, email, password, vehType, plateNum } = req.body;

  if (!username || !email || !password || !vehType || !plateNum) {
    return res.status(400).send('Missing fields');
  }

  try {
    // 1) Check if email exists
    const [existing] = await pool.query(
      'SELECT UserID FROM Users WHERE Email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).send('Email already registered');
    }

    // 2) Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Insert user as CUSTOMER
    const role = 'CUSTOMER';
    const [userResult] = await pool.query(
      `INSERT INTO Users (Username, Email, PasswordHash, Address, Role)
       VALUES (?, ?, ?, ?, ?)`,
      [username, email, passwordHash, 'N/A', role]
    );
    const newUserId = userResult.insertId;

    // 4) Insert vehicle
    await pool.query(
      `INSERT INTO Vehicles (UserID, VehType, PlateNum)
       VALUES (?, ?, ?)`,
      [newUserId, vehType, plateNum]
    );

    // Optionally auto-login:
    req.session.userId   = newUserId;
    req.session.role     = role;
    req.session.username = username;

    return res.json({ success: true });
  } catch (err) {
    console.error('Customer register error:', err);
    return res.status(500).send('Server error');
  }
});


// Customer login
app.post('/customer/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Missing email or password');
  }

  try {
    const [rows] = await pool.query(
      'SELECT UserID, Username, PasswordHash, Role FROM Users WHERE Email = ?',
      [email]
    );
    if (rows.length === 0) {
      return res.status(400).send('Invalid email or password');
    }

    const user = rows[0];
    if (user.Role !== 'CUSTOMER') {
      return res.status(403).send('This account is not a customer account');
    }

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
      return res.status(400).send('Invalid email or password');
    }

    const [vehRows] = await pool.query(
      'SELECT VehID, VehType, PlateNum FROM Vehicles WHERE UserID = ? LIMIT 1',
      [user.UserID]
    );
    const vehicle = vehRows[0] || null;

    req.session.userId   = user.UserID;
    req.session.role     = user.Role;
    req.session.username = user.Username;
    if (vehicle) {
      req.session.vehId    = vehicle.VehID;
      req.session.vehType  = vehicle.VehType;
      req.session.plateNum = vehicle.PlateNum;
    }

    // send username so frontend can show greeting
    return res.json({
      success:  true,
      role:     user.Role,
      username: user.Username,
      vehicle
    });
  } catch (err) {
    console.error('Customer login error:', err);
    return res.status(500).send('Server error');
  }
});
// ================= PROTECTED API =================

app.get('/api/dashboard-stats', requireRole('ADMIN'), async (req, res) => {
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

// Example: Booking endpoints for CUSTOMER (or ADMIN as you wish)
app.get('/api/area/:id', requireLogin, async (req, res) => {
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

app.get('/api/area/:id/slots', requireLogin, async (req, res) => {
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

app.post('/api/slot/:slotId/book', requireLogin, async (req, res) => {
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

app.post('/api/slot/:slotId/unbook', requireLogin, async (req, res) => {
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
// Message for Admin registration success
app.get('/api/auth/message', (req, res) => {
  const msg = req.session.regSuccessMessage || null;
  req.session.regSuccessMessage = null;
  res.json({ message: msg });
});



// ====== Booking & Payment ======

app.post('/api/booking', requireLogin, async (req, res) => {
  const UserID    = req.session.userId;
  const VehicleID = req.session.vehId || null;

  const {
    AreaID,
    SlotID,
    FirstName,
    LastName,
    Email,
    Phone,
    UserAddress,
    StartTime,
    EndTime,
    TotalCost,
    PayMethod
  } = req.body;

  if (!UserID) {
    return res.status(401).json({ success: false, error: 'Not logged in' });
  }

  if (!AreaID || !SlotID || !FirstName || !LastName || !Email || !Phone ||
      !UserAddress || !StartTime || !EndTime || !TotalCost || !PayMethod) {
    console.log('Missing fields in booking body:', req.body);
    return res.status(400).json({ success: false, error: 'Missing booking fields' });
  }

  if (!VehicleID) {
    return res.status(400).json({ success: false, error: 'No vehicle associated with this account' });
  }

  const BookingStat = 'PENDING';
  const PayStat     = 'Unpaid';

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [bookingResult] = await conn.query(
      `INSERT INTO Booking
       (UserID, AreaID, SlotID, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime, BookingStat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [UserID, AreaID, SlotID, FirstName, LastName, Email, Phone, UserAddress, StartTime, EndTime, BookingStat]
    );
    const BookingID = bookingResult.insertId;

    await conn.query(
      "UPDATE ParkingSlot SET CurrentVehID = ?, SlotStatus = 'not available' WHERE SlotID = ?",
      [VehicleID, SlotID]
    );

    await conn.query(
      `INSERT INTO Payment
       (UserID, BookingID, TotalCost, PayStat, PayMethod)
       VALUES (?, ?, ?, ?, ?)`,
      [UserID, BookingID, TotalCost, PayStat, PayMethod]
    );

    await conn.commit();
    conn.release();

    res.json({
      success: true,
      BookingID,
      message: "Booking and payment registered, awaiting payment."
    });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Booking error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Users CRUD – protect with ADMIN
app.get('/api/users', requireRole('ADMIN'), async (req, res) => {
  const [rows] = await pool.query('SELECT UserID, Username, PasswordHash, Email, Address, Role FROM Users');
  res.json(rows);
});

app.post('/api/users', requireRole('ADMIN'), async (req, res) => {
  const { Username, Email, Password, Address, Role } = req.body;
  const hash = await bcrypt.hash(Password, 10);
  await pool.query(
    'INSERT INTO Users (Username, Email, PasswordHash, Address, Role) VALUES (?, ?, ?, ?, ?)',
    [Username, Email, hash, Address, Role]
  );
  res.status(201).json({ success: true });
});

app.put('/api/users/:id', requireRole('ADMIN'), async (req, res) => {
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

app.delete('/api/users/:id', requireRole('ADMIN'), async (req, res) => {
  await pool.query('DELETE FROM Users WHERE UserID=?', [req.params.id]);
  res.json({ success: true });
});

// Bookings list (ADMIN dashboard)
app.get('/api/bookings', requireRole('ADMIN'), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, p.PayStat, p.PayMethod, p.TotalCost
    FROM Booking b
    LEFT JOIN Payment p ON b.BookingID = p.BookingID
    ORDER BY b.BookingID DESC
  `);
  res.json(rows);
});

app.get('/api/bookings/:id', requireRole('ADMIN'), async (req, res) => {
  const [rows] = await pool.query(`
    SELECT b.*, p.PayStat, p.PayMethod, p.TotalCost
    FROM Booking b
    LEFT JOIN Payment p ON b.BookingID = p.BookingID
    WHERE b.BookingID = ?
  `, [req.params.id]);
  res.json(rows[0] || {});
});

app.put('/api/bookings/:id', requireRole('ADMIN'), async (req, res) => {
  const { EndTime, BookingStat } = req.body;
  await pool.query(
    `UPDATE Booking SET EndTime = ?, BookingStat = ? WHERE BookingID = ?`,
    [EndTime, BookingStat, req.params.id]
  );
  res.json({ success: true });
});

app.put('/api/bookings/:id/payment', requireRole('ADMIN'), async (req, res) => {
  const { PayStat } = req.body;
  await pool.query(`UPDATE Payment SET PayStat=? WHERE BookingID=?`, [PayStat, req.params.id]);

  if (PayStat === 'Paid') {
    const [rows] = await pool.query('SELECT SlotID, VehicleID FROM Booking WHERE BookingID=?', [req.params.id]);
    if (rows.length) {
      const { SlotID, VehicleID } = rows[0];
      await pool.query(
        "UPDATE ParkingSlot SET SlotStatus='not available', CurrentVehID=? WHERE SlotID=?",
        [VehicleID || 1, SlotID]
      );
    }
  }
  res.json({ success: true });
});

// Convert '2025-11-04T21:00' to '2025-11-04 21:00:00'
function normalizeDateTime(htmlInput) {
  if (!htmlInput) return null;
  // Handles 'YYYY-MM-DDTHH:mm' -> 'YYYY-MM-DD HH:mm:00'
  return htmlInput.replace('T', ' ') + (htmlInput.length === 16 ? ':00' : '');
}
// Admin edits booking + payment info in one call
app.put('/api/bookings/:id/admin-edit', requireRole('ADMIN'), async (req, res) => {
  let { EndTime, BookingStat, PayStat } = req.body;
  const BookingID = req.params.id;

  if (EndTime && EndTime.includes('T')) {
    EndTime = normalizeDateTime(EndTime); // your existing helper
  }

  const conn = await pool.getConnection();
  try {
    const [[bookingRow]] = await conn.query(
      "SELECT StartTime FROM Booking WHERE BookingID=?",
      [BookingID]
    );
    if (!bookingRow) throw new Error("Booking not found.");

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

    if (PayStat === 'Paid') {
      const [rows] = await conn.query(
        'SELECT SlotID, VehicleID FROM Booking WHERE BookingID=?',
        [BookingID]
      );
      if (rows.length) {
        const { SlotID, VehicleID } = rows[0];
        await conn.query(
          "UPDATE ParkingSlot SET SlotStatus='not available', CurrentVehID=? WHERE SlotID=?",
          [VehicleID || 1, SlotID]
        );
      }
    }

    await conn.commit();
    conn.release();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    conn.release();
    console.error('Admin booking edit error:', err);
    res.status(400).json({ success: false, error: err.message });
  }
})
// DB test endpoints
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
    const [rows] = await pool.query(
      'SELECT UserID, username, email, role FROM Users ORDER BY UserID DESC LIMIT 1'
    );
    res.json(rows[0] || null);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));

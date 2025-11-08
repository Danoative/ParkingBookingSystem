const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { connectDB, sql } = require('./db');

const app = express();
app.use(bodyParser.json());

// Connect once when starting server
connectDB();

// POST /admin/register  -> create admin account
app.post('/admin/register', async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Missing fields.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await sql.query`
            INSERT INTO Admins (FullName, Email, PasswordHash)
            VALUES (${fullName}, ${email}, ${hashedPassword});
        `;

        res.status(201).json({ message: 'Admin account created successfully.' });
    } catch (err) {
        console.error('Insert Error:', err);
        res.status(500).json({ message: 'Error creating admin.' });
    }
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await sql.query`SELECT * FROM Admins WHERE Email = ${email}`;
        const admin = result.recordset[0];

        if (!admin) return res.status(400).json({ message: 'Invalid email.' });

        const match = await bcrypt.compare(password, admin.PasswordHash);
        if (!match) return res.status(400).json({ message: 'Invalid password.' });

        res.json({ message: 'Login successful', admin });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: 'Login failed.' });
    }
});
// test endpoint
app.get('/', (req, res) => {
    res.send('Parking Booking System backend is running!');
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

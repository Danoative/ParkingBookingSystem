// db.js
const mysql = require('mysq12');

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ParkingBookingSystem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(config);
// Promise-wrapped pool
const promisePool = pool.promise();


async function connectDB() {
  try {
    // simple sanity check
    const [rows] = await promisePool.query('SELECT 1');
    console.log('✅ Connected to MySQL.');
    return rows;
  } catch (err) {
    console.error('❌ DB Connection Error:', err);
    throw err;
  }
}

module.exports = { connectDB, pool: promisePool };

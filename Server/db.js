// db.js
const sql = require('mssql/msnodesqlv8');

const config = {
    driver: 'msnodesqlv8',
    server: 'localhost\\SQLEXPRESS',
    port: 1433,
    database: 'ParkingBookingSystem',
    options: {
        trustServerCertificate: true,
        trustedConnection: true,
    }
};

async function connectDB(){
    try {
        await sql.connect(config);
        console.log('✅ Connected via Windows Authentication.');
    } catch (err) {
        console.error('❌ DB Connection Error:', err);
    }
}
const pool = new sql.ConnectionPool(config).connect();

module.exports = { connectDB, sql, pool };

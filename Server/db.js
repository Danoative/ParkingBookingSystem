// db.js
const sql = require('mssql');

const config = {
    driver: 'msnodesqlv8',
    server: 'LAPTOP-DANOATIV\\SQLEXPRESS',
    database: 'ParkingBookingSystem',
    options: {
        trustedConnection: true
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

module.exports = { connectDB, sql };

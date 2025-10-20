const sql = require('mssql');

const config = {
    driver: 'msnodesqlv8',
    server: 'LAPTOP-DANOATIV\SQLEXPRESS',
    database: 'ParkingBookingSystem',
    options:{
        trustedConnection: true
    }
};

async function connectDB(){
    try{
        await sql.connect(config);
        console.log('Connected via the Windows Authentication.');
    } catch (err){
        console.error('DB Conneciton Error', err);
    }
}

module.exports = {connectDB, sql};
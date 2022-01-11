const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db_path = path.resolve(__dirname, '../database', 'data.sqlite3');

const appDatabase = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, err => {
    if (err) { console.log("Issue while connecting to DB...", err.message); }
    console.log("Connected to DB...");
});

module.exports = { appDatabase };


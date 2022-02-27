const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('../utils/writetoLogs');
const moment = require('moment');
const logfilePath = require('../utils/createLogfile');

let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');

const logfileName = logfilePath.filePath;
console.file(logfileName);

const db_path = path.resolve(__dirname, '../database', 'data.sqlite3');

const appDatabase = new sqlite3.Database(db_path, sqlite3.OPEN_READWRITE, err => {
    if (err) { 
        console.log(`[${timestamp}]: Issue while connecting to database. Investigation required!`); 
    }
    console.log(`[${timestamp}]: Application connected to database in path: ${db_path}`); 
});

module.exports = { appDatabase };


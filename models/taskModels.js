const database = require('../database/database');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const insertTicket = (TICKET, RESOLUTION, CATEGORY, DESCRIPTION, NAME, APP, CREATED_ON, MON, callback) => {
    const sql = "INSERT INTO tickets (TICKET, RESOLUTION, TICKET_TYPE, COMMENT, RESOLVED_BY, APP_NM, CREATED_ON, MON) VALUES (?,?,?,?,?,?,?,?)";

    database.appDatabase.run(sql, [TICKET, RESOLUTION, CATEGORY, DESCRIPTION, NAME, APP, CREATED_ON, MON], (err) => {
        if (err) {
            callback(err.message);
        }

        const successMsg = "Ticket inserted...";
        callback(successMsg);
    });
};

const ticketCategory = (callback) => {
    var cat = [];
    const file = path.resolve(__dirname, '../category', 'ticketCategory.csv');
    fs.createReadStream(file).pipe(csv()).on('data', (row)=> {
        cat.push(row);
    }).on('end', () => {
        callback(cat);
    });
};

const exportAllCSV = (callback) => {
    const sql = "SELECT * FROM tickets ORDER BY TICKET DESC";

    database.appDatabase.all(sql, [], (err, rows) => {
        if (err) {
            callback(err.message);
        }
        
        callback(rows);
    });
};

const exportPrevious = (mon, callback) => {
    const sql = "SELECT * FROM tickets WHERE MON = ? ORDER BY TICKET DESC";

    database.appDatabase.all(sql, [mon], (err, rows) => {
        if (err) {
            callback(err.message);
        }

        callback(rows);
    });
};

const searchTicket = (ticket, callback) => {
    const sql = "SELECT * FROM tickets where TICKET = ?";

    database.appDatabase.get(sql, [ticket], (err, row) => {
        if (err) {
            callback(err.message);
        }
        
        callback(row);
    });
};

const getData = (mon, callback) => {
    const sql = "SELECT * FROM tickets WHERE MON = ? ORDER BY TICKET DESC";

    database.appDatabase.all(sql, [mon], (err, rows) => {
        if (err) {
            callback(err.message);
        }

        callback(rows);
    });
};

const getCount = () => {
    const sql = "SELECT count(*) FROM tickets";

    database.appDatabase.get(sql, [], (err, results) => {
        if (err) {
            callback(err.message);
        }

        return results;
    });
};


module.exports = {
    insertTicket,
    ticketCategory,
    exportAllCSV,
    searchTicket,
    getCount,
    exportPrevious,
    getData
};


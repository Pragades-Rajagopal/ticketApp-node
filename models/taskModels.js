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


module.exports = {
    insertTicket,
    ticketCategory
};


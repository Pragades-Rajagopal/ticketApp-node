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

const updateTicket = (TICKET, RESOLUTION, CATEGORY, DESCRIPTION, callback) => {

    const sql = "UPDATE tickets SET RESOLUTION = ?, TICKET_TYPE = ?, COMMENT = ? WHERE TICKET = ?";

    database.appDatabase.run(sql, [RESOLUTION, CATEGORY, DESCRIPTION, TICKET], (err) => {
        if (err) {
            callback(err.message);
        }

        const successMsg = "Ticket updated...";
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
    const sql = "SELECT TICKET \"Ticket_ID\", APP_NM \"Application\", TICKET_TYPE \"IM/SRQ\", RESOLUTION \"Category\", COMMENT \"RCA/Remarks\", CREATED_ON, MON, RESOLVED_BY FROM tickets ORDER BY TICKET DESC";

    database.appDatabase.all(sql, [], (err, rows) => {
        if (err) {
            callback(err.message);
        }
        
        callback(rows);
    });
};

const getMonths = (callback) => {

    const sql = "SELECT DISTINCT MON FROM tickets ORDER BY TICKET DESC LIMIT 12";

    database.appDatabase.all(sql, [], (err, row) => {
        if (err) {
            callback(err.message);
        }
        callback(row);
    });
};

const exportMonth = (mon, callback) => {
    const sql = "SELECT TICKET \"Ticket_ID\", APP_NM \"Application\", TICKET_TYPE \"IM/SRQ\", RESOLUTION \"Category\", COMMENT \"RCA/Remarks\", CREATED_ON, MON, RESOLVED_BY FROM tickets WHERE MON = ? ORDER BY TICKET DESC";

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

const incidentCount = (month, callback) => {
    const sql = "SELECT TICKET FROM tickets where MON = ?  and TICKET_TYPE = 'Incident'";

    database.appDatabase.all(sql, [month], (err, result) => {
        if (err) {
            callback (err.message);
        }

        callback(result)
    });
}

const requestCount = (month, callback) => {
    const sql = "SELECT TICKET COUNT_ FROM tickets where MON = ?  and TICKET_TYPE = 'Service Request'";

    database.appDatabase.all(sql, [month], (err, result) => {
        if (err) {
            callback (err.message);
        }

        callback(result)
    });
}



module.exports = {
    insertTicket,
    ticketCategory,
    exportAllCSV,
    searchTicket,
    exportMonth,
    getData,
    updateTicket,
    getMonths,
    incidentCount,
    requestCount
};


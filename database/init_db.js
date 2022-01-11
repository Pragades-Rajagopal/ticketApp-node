const sqlite3 = require('sqlite3').verbose();
const path = require('path');

var db_path = path.resolve(__dirname, 'data.sqlite3');

let db = new sqlite3.Database(path.resolve(db_path), sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log("error at db creation", db_path);
        console.log(err.message);
    }

    else {
        console.log("Database connectivity success");
        // createTable();
        readData();
    }
});

// const createTable = () => {
//     console.log("Creating table...");
//     db.run("CREATE TABLE IF NOT EXISTS tickets (APP_NM text not null, TICKET integer primary key, RESOLUTION text not null, TICKET_TYPE text not null, COMMENT text not null, CREATED_ON text not null, MON text not null, RESOLVED_BY text not null);", insertData)
// };

// const insertData = () => {
//     console.log("Inserting data into table...");
//     db.run("INSERT INTO tickets (APP_NM, TICKET, RESOLUTION, TICKET_TYPE, COMMENT, CREATED_ON, MON, RESOLVED_BY) VALUES (?,?,?,?,?,?,?,?)", ['REPC', '10033930', 'Order closure - XML Failure', 'Incident', 'NA', '2022/01/11 04:14:13', 'Jan2022', 'Bharat'], readData);
// };

const readData = () => {
    console.log("Reading data...");

    db.all("SELECT * FROM tickets", (err, rows) => {
        if (err) { throw err; }
        rows.forEach((row) => {
            console.log(row.TICKET + " : "+ row.RESOLUTION + " : "+ row.CREATED_ON);
        });
    });
};

db.close();



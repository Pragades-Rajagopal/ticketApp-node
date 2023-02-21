const database = require('../connector/database');
// const csv = require('csv-parser');
// const fs = require('fs');
// const path = require('path');

const getTicketnumberInt = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT MAX(TICKET) AS TICKET FROM tickets";

        database.appDatabase.all(sql, [], (err, row) => {
            if (err) {
                reject('getTicketnumberInt function: Error while fetching data!');
            }
            let value;
            value = Number(row[0].TICKET) + 1
            resolve(value)
        })
    });
};


const insertTicket = (data) => {
    return new Promise(async (resolve, reject) => {
        const sql = "INSERT INTO tickets (TICKET_NEW, RESOLUTION, TICKET_TYPE, COMMENT, RESOLVED_BY, APP_NM, CREATED_ON, MON, TICKET) VALUES (?,?,?,?,?,?,?,?,?)";

        try {
            // Fix for snow migration
            let ticketInt = await getTicketnumberInt();

            database.appDatabase.run(sql, [data.TICKET, data.DESCR, data.CATEGORY, data.COMMENT, data.USER, data.APP, data.CREATED_ON, data.MON, ticketInt], (err) => {
                if (err) {
                    reject('insertTicket function: Error while inserting data!');
                }

                const successMsg = `Reference ticket no. ${ticketInt}`;
                resolve(successMsg);
            });
        } catch (error) {
            reject(error)
        }
    });
};

const updateTicket = (data) => {
    return new Promise((resolve, reject) => {
        const sql = "UPDATE tickets SET RESOLUTION = ?, TICKET_TYPE = ?, COMMENT = ? WHERE TICKET_NEW = ?";

        database.appDatabase.run(sql, [data.DESCR, data.CATEGORY, data.COMMENT, data.TICKET], (err) => {
            if (err) {
                reject('updateTicket function: Error while updating data!');
            }

            const successMsg = "Ticket updated...";
            resolve(successMsg);
        });
    });
};

const searchTicket = (ticket) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tickets where TICKET_NEW = ?";

        database.appDatabase.get(sql, [ticket], (err, row) => {
            if (err) {
                reject("searchTicket function: Error while fetching data!");
            }
            resolve(row);
        });
    });
};

const ticketCategory = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM resolutions";

        database.appDatabase.all(sql, [], (err, rows) => {
            if (err) {
                reject('ticketCategory function: Error while fetching data!')
            }
            resolve(rows);
        });
    });
};

const searchResolution = (resol) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM resolutions WHERE CATEGORY = ?";

        database.appDatabase.all(sql, [resol], (err, row) => {
            if (err) {
                reject('ticketCategory function: Error while fetching data!');
            }
            resolve(row);
        })
    });
};

const upsertResolution = (action, data) => {
    return new Promise((resolve, reject) => {

        if (action === 'UPDATE') {
            const sql = "UPDATE resolutions SET COMMENT = ?, TYPE = ? WHERE CATEGORY = ?";

            database.appDatabase.run(sql, [data.comment, data.category, data.resolution], (err) => {
                if (err) {
                    reject('upsertResolution function: Error while updating data!');
                }
                resolve('success');
            });
        }
        else if (action === 'INSERT') {
            const sql = "INSERT INTO resolutions (CATEGORY, COMMENT, TYPE) VALUES(?, ?, ?)";

            database.appDatabase.run(sql, [data.resolution, data.comment, data.category], (err) => {
                if (err) {
                    reject('upsertResolution function: Error while inserting data!');
                }
                resolve('success');
            });
        }
    });

};

const delResolution = (resolution) => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM resolutions WHERE CATEGORY = ?";

        database.appDatabase.run(sql, [resolution], (err) => {
            if (err) {
                reject('delResolution function: Error while deleting resolution!');
            }
            resolve('success');
        });
    });
};

const getMonths = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT DISTINCT MON FROM tickets ORDER BY TICKET_NEW DESC LIMIT 12";

        database.appDatabase.all(sql, [], (err, row) => {
            if (err) {
                reject('getMonths function: Error while fetching data!');
            }
            resolve(row);
        });
    });
};

const getAllDistinctMonths = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT DISTINCT MON FROM tickets ORDER BY TICKET_NEW DESC";

        database.appDatabase.all(sql, [], (err, row) => {
            if (err) {
                reject('getAllDistinctMonths function: Error while fetching data!');
            }
            resolve(row);
        });
    })
};

const exportAllCSV = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT TICKET_NEW \"Ticket_ID\", APP_NM \"Application\", TICKET_TYPE \"IM/SRQ\", RESOLUTION \"Category\", COMMENT \"RCA/Remarks\", CREATED_ON, MON, RESOLVED_BY FROM tickets ORDER BY TICKET DESC";

        database.appDatabase.all(sql, [], (err, rows) => {
            if (err) {
                reject('exportAllCSV function: Error while fetching data!');
            }
            resolve(rows);
        });
    });
};

const exportMonth = (mon) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT TICKET_NEW \"Ticket_ID\", APP_NM \"Application\", TICKET_TYPE \"IM/SRQ\", RESOLUTION \"Category\", COMMENT \"RCA/Remarks\", CREATED_ON, MON, RESOLVED_BY FROM tickets WHERE MON = ? ORDER BY TICKET DESC";

        database.appDatabase.all(sql, [mon], (err, rows) => {
            if (err) {
                reject('exportMonth function: Error while fetching data!');
            }
            resolve(rows);
        });
    });
};

const exportMonthRange = (mon, callback) => {
    return new Promise((resolve, reject) => {
        // This function will frame the sql query based on the input passed from exportForRange() with array of months
        const selectClause = "SELECT TICKET_NEW \"Ticket_ID\", APP_NM \"Application\", TICKET_TYPE \"IM/SRQ\", RESOLUTION \"Category\", COMMENT \"RCA/Remarks\", CREATED_ON, MON, RESOLVED_BY FROM tickets WHERE";
        const orderClause = "ORDER BY TICKET DESC";
        var whereClause = ' MON IN (\"' + mon.join("\",\"") + '\")';
        const sql = selectClause + whereClause + orderClause;

        database.appDatabase.all(sql, [], (err, rows) => {
            if (err) {
                reject('exportMonthRange function: Error while fetching data!');
            }
            resolve(rows);
        });
    });
};

const getData = (mon) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tickets WHERE MON = ? ORDER BY TICKET_NEW DESC";

        database.appDatabase.all(sql, [mon], (err, rows) => {
            if (err) {
                reject("getData function: Error while fetching data!");
            }
            resolve(rows);
        });
    });
};

const getDataByCategory = (mon) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM TICKETS_V2 WHERE MONTH = ? ORDER BY TICKET_COUNT DESC";

        database.appDatabase.all(sql, [mon], (err, rows) => {
            if (err) {
                reject("getDataByCategory function: Error while fetching data!");
            }
            resolve(rows);
        });
    });
};

const getAllData = () => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM tickets ORDER BY TICKET_NEW DESC";

        database.appDatabase.all(sql, [], (err, rows) => {
            if (err) {
                reject("getAllData function: Error while fetching data!");
            }
            resolve(rows);
        });
    });
};

const incidentCount = (month) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT TICKET FROM tickets where MON = ?  and TICKET_TYPE = 'Incident'";

        database.appDatabase.all(sql, [month], (err, result) => {
            if (err) {
                reject("incidentCount function: Error while fetching data!");
            }
            resolve(result)
        });
    });
}

const requestCount = (month) => {
    return new Promise((resolve, reject) => {
        const sql = "SELECT TICKET COUNT_ FROM tickets where MON = ?  and TICKET_TYPE = 'Service Request'";

        database.appDatabase.all(sql, [month], (err, result) => {
            if (err) {
                reject("requestCount function: Error while fetching data!");
            }
            resolve(result)
        });
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
    requestCount,
    getAllData,
    getDataByCategory,
    searchResolution,
    upsertResolution,
    delResolution,
    getAllDistinctMonths,
    exportMonthRange
};


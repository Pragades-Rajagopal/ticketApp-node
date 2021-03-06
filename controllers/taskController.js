const taskModel = require('../models/taskModels');
const { validationResult } = require('express-validator');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');
require('../utils/writetoLogs');
const logfilePath = require('../utils/createLogfile');
const conf = require('./configuration')

const logfileName = logfilePath.filePath;
console.file(logfileName);


function index_page_get (req, res) {
    
    taskModel.ticketCategory((resolution) => {
        taskModel.getMonths((month) => {
            res.locals.title = "Ticket Tool";
            res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors:{}, MONTH: month, actionmsg: null, filename: null});
        });
        
    });
    
};

function index_page_post (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        taskModel.ticketCategory((resolution) => {
            // console.log(resolution)
            taskModel.getMonths((month) => {
                res.locals.title = "Ticket Tool";
                res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, MONTH: month, errors:errors.mapped(), actionmsg: null, filename: null});
            });
            
        });
        return;
    }
    
    const TICKET = req.body.Ticket;
    const DESCR = req.body.DESCR;
    const CATEGORY = req.body.CATEGORY;
    const COMMENT = req.body.COMMENT;
    const USER = req.body.USER;
    const APP = req.body.APP;
    let timeGMT = moment.utc().format('YYYY/MM/DD hh:mm:ss');
    let MON = moment.utc().format('MMMYYYY');

    // To check if the ticket no. contains any character or special characters
    const xpressn = /^[0-9]+$/;
    const checkValue = xpressn.test(TICKET);

    if (checkValue === false) {
        const actionmsg = "Ticket number contains (special) characters!";

        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Ticket "${TICKET}" contains character and action failed to post the data. [Responsible user: ${USER}]`);

        res.locals.title = "Ticket Tool";
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                res.locals.title = "Ticket Tool";
                res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors:{}, MONTH: month, actionmsg: actionmsg, filename: null});
            });
        });
        return;
    }

    taskModel.searchTicket(TICKET, (result) => {
        // console.log(result);
        if (result) {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${TICKET}" already exists and action failed to post the data. [Responsible user: ${USER}]`);

            const actionmsg = `Ticket "${TICKET}" was already categorized under "${result.RESOLUTION}" by "${result.RESOLVED_BY}"`;

            res.locals.title = "Ticket Tool";
            taskModel.ticketCategory((resolution) => {
                taskModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool";
                    res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors:{}, MONTH: month, actionmsg: actionmsg, filename: null});
                });
            });
            return;
        }

        taskModel.insertTicket(TICKET, DESCR, CATEGORY, COMMENT, USER, APP, timeGMT, MON, (result) => {
            // console.log(result);
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${TICKET}" logged in the application with data: ["${DESCR}", "${CATEGORY}", "${COMMENT}", "${USER}"]`);
            
            res.locals.title = "Ticket Tool";
            res.redirect('/ticket-tool');
        });
    });
};

function search_ticket (req, res) {

    const ticket = req.body.ticketnum;
    // to check if the ticket number is searched with null
    const xpressn = /^\s*$/;
    const ticketIsNull = xpressn.test(ticket);

    if (ticketIsNull === true) {
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                const actionmsg = "Search with a ticket number!"
                res.locals.title = "Ticket Tool";
                res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, MONTH: month, errors:{}, actionmsg: actionmsg, filename: null});
                
            });
        });
        return;
    }

    taskModel.searchTicket(ticket, (result) => {
        // console.log(result);
        if (!result) {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${ticket}" was searched and not available in the application`);

            const actionmsg = `Ticket "${ticket}" does not exist!`;

            res.locals.title = "Ticket Tool";
            taskModel.ticketCategory((resolution) => {
                taskModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool";
                    res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors:{}, MONTH: month, actionmsg: actionmsg, filename: null});
                });
            });
            return;
        }
        
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                console.log(`[${timestamp}]: Ticket "${ticket}" was searched in the application`);

                res.locals.title = "Ticket Tool - Search";
                res.render('search', {resolution: resolution, result: result, MONTH: month, errors: {}, actionmsg: null});
            });
        });
        
    });

};

function search_page_update (req, res) {

    const TICKET = req.body.Ticket;

    errors = validationResult(req);

    if (!errors.isEmpty()) {
        
        taskModel.searchTicket(TICKET, (value) => {
            taskModel.ticketCategory((resolution) => {
                taskModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool - Search";
                    res.render('search', {resolution: resolution, result: value, MONTH: month, errors: errors.mapped(), actionmsg: null});
                });
            });
        });
        return;
    }

    const DESCR = req.body.DESCR;
    const CATEGORY = req.body.CATEGORY;
    const COMMENT = req.body.COMMENT;
    
    taskModel.updateTicket(TICKET, DESCR, CATEGORY, COMMENT, (result) => {
        // console.log(result);

        taskModel.searchTicket(TICKET, (value) => {
            taskModel.ticketCategory((resolution) => {
                
                taskModel.getMonths((month) => {
                    let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                    console.log(`[${timestamp}]: Ticket "${TICKET}" was updated with data: ["${DESCR}", "${CATEGORY}","${COMMENT}"]`);
                    const actionmsg = "Ticket detail updated successfully!"
                    res.locals.title = "Ticket Tool - Search";
                    res.render('search', {resolution: resolution, result: value, MONTH: month, errors:{}, actionmsg: actionmsg});
                });
            });
        });
        
    });

};

let monthForCat; 

function getTicketData (req, res) {

    const MON = req.body.viewMONTH;
    monthForCat = MON;

    if (MON === 'All') {
        taskModel.getAllData((result) => {
            taskModel.getMonths((month) => {
                let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                console.log(`[${timestamp}]: Viewed ticket details for all months`);
    
                res.locals.title = "Ticket Tool - View all data";
                res.render('viewdata', {result: result, MONTH: month, MON: 'All Months', i_count: {}, r_count: {}});
            });
        });
        return;
    }

    taskModel.getData(MON, (result) => {
        
        taskModel.getMonths((month) => {
            taskModel.incidentCount(MON, (i_count) => {
                taskModel.requestCount(MON, (r_count) => {
                    let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                    console.log(`[${timestamp}]: Viewed ticket details for month: [${MON}]`);

                    res.locals.title = `Ticket Tool - View data for ${MON}`;
                    res.render('viewdata', {result: result, MONTH: month, MON: MON, i_count: i_count, r_count: r_count});
                });
            });
        });
    });
};

function getTicketDataByCategory (req, res) {

    taskModel.getDataByCategory(monthForCat, (result) => {
        taskModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - View by Category";
            res.render('viewdataByCat', {MONTH: month, MON: monthForCat, result: result});

            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Viewed ticket details by category for month: [${monthForCat}]`);
        });
    })
}

// this function is obsolete and handled in getTicketData() with condition MON === "All"
// but endpoint '/ticket-tool/view-all' is still active
function getTicketDataAll (req, res) {

    taskModel.getAllData((result) => {
        taskModel.getMonths((month) => {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Viewed ticket details for all months`);

            res.locals.title = "Ticket Tool - View all data";
            res.render('viewdata', {result: result, MONTH: month, MON: 'All Months', i_count: {}, r_count: {}});
        });
    })
};

function exportAllCSV (req, res) {
    
    taskModel.exportAllCSV((result) => {
        // console.log(result);

        const filePath = path.resolve(__dirname, '../', 'public', 'exports');
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticketAll_' + time + '.csv';
        const endPath = filePath + '\\' + filename;
        // console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, {headers:true})
        .on("finish", () => {

            taskModel.getMonths((months) => {
                taskModel.getAllDistinctMonths((allMonths) => {
                    // months will be pushed to below arrays and reversed in rev_month array
                    let month = [];
                    let rev_month = [];
                    for (let i = 0; i < months.length; i++) {
                        month.push(months[i]['MON']);
                        rev_month.push(months[i]['MON']);
                    }
                    rev_month = rev_month.reverse();
        
                    const monthFrom = allMonths[allMonths.length - 1];
                    const monthTo = allMonths[0];
                    
                    res.render('exportpage', {month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename});
                });
            });
        })
        .pipe(ws);

        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Exported data for all months`);
    });
};

function exportSelectedMonth (req, res) {

    const MON = req.body.SELECTED_MON;
    
    taskModel.exportMonth(MON, (result) => {
        // console.log(result);

        const filePath = path.resolve(__dirname, '../', 'public', 'exports');
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticket_'+ MON +'_' + time + '.csv';
        const endPath = filePath + '\\' + filename;
        // console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, {headers:true})
        .on("finish", () => {
            
            taskModel.getMonths((months) => {
                taskModel.getAllDistinctMonths((allMonths) => {
        
                    let month = [];
                    let rev_month = [];
                    for (let i = 0; i < months.length; i++) {
                        month.push(months[i]['MON']);
                        rev_month.push(months[i]['MON']);
                    }
                    rev_month = rev_month.reverse();
        
                    const monthFrom = allMonths[allMonths.length - 1];
                    const monthTo = allMonths[0];
                    
                    res.render('exportpage', {month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename});
                });
            });
        })
        .pipe(ws);

        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Exported data for month: [${MON}]`);
    });
};

function getExportPage (req, res) {

    taskModel.getMonths((months) => {
        taskModel.getAllDistinctMonths((allMonths) => {

            let month = [];
            let rev_month = [];
            for (let i = 0; i < months.length; i++) {
                month.push(months[i]['MON']);
                rev_month.push(months[i]['MON']);
            }
            rev_month = rev_month.reverse();

            const monthFrom = allMonths[allMonths.length - 1];
            const monthTo = allMonths[0];
            
            res.render('exportpage', {month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: null});
        });
    });
}

function exportForRange (req, res) {

    const from = req.body.FROM;
    const to = req.body.TO;

    taskModel.getMonths((result) => {
        let month = [];
        let rev_month = [];
        for (let i = 0; i < result.length; i++) {
            month.push(result[i]['MON']);
            rev_month.push(result[i]['MON']);
        }
        rev_month = rev_month.reverse();

        const indexOfFrom = month.indexOf(from);
        const indexofTo = month.indexOf(to);

        if (indexofTo > indexOfFrom) {
            taskModel.getAllDistinctMonths((allMonths) => {
                const monthFrom = allMonths[allMonths.length - 1];
                const monthTo = allMonths[0];

                res.render('exportpage', {month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: 'FROM MONTH SHOULD BE LESS THAN TO MONTH!', filename: null});
            });
            
            return;
        }
        else {
            const monthRange = month.slice(indexofTo, indexOfFrom + 1);

            taskModel.exportMonthRange(monthRange, (output) => {
                
                const filePath = path.resolve(__dirname, '../', 'public', 'exports');
                let time = moment.utc().format('YYYYMMDDhhmmss');
                const filename = 'ticket_rng_' + time + '.csv';
                const endPath = filePath + '\\' + filename;
                // console.log(endPath);

                var ws = fs.createWriteStream(endPath);
                fastcsv.write(output, {headers:true})
                .on("finish", () => {

                    taskModel.getAllDistinctMonths((allMonths) => {
                        const monthFrom = allMonths[allMonths.length - 1];
                        const monthTo = allMonths[0];
        
                        res.render('exportpage', {month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename});
                    });
                })
                .pipe(ws); 
            });  
            
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Exported data for month range: [${monthRange}]`);
        }
    });
}

function configurations_get (req, res) {

    taskModel.ticketCategory((resolution) => {
        taskModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - Configurations";
            res.render('config', {MONTH: month, resolution: resolution, errors:{}, actionmsg: null});
        });
    });
};

function newResolution_put (req, res) {

    let actionmsg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                res.locals.title = "Ticket Tool - Configurations";
                res.render('config', {MONTH: month, resolution: resolution, errors: errors.mapped(), actionmsg: null});
            })
        });        
        return;
    };

    var resolution = req.body.DESCR;
    // to trim leading and trailing whitespaces
    resolution = resolution.trim();
    var comment = req.body.COMMENT;
    const category = req.body.CATEGORY;

    // if the comment is not passed, value is set as NA by default
    if (!comment) {
        comment = 'NA'
    }

    actionmsg = `Resolution "${resolution}" configured/ updated successfully!`;

    taskModel.searchResolution(resolution, (result) => {
        if (result.length === 0) {
            taskModel.putResolution('INSERT', resolution, comment, category, (data) => {
                let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                console.log(`[${timestamp}]: New resolution was configured ["${resolution}", "${comment}", "${category}"]`);
                return;
            });
        }
        else {
            taskModel.putResolution('UPDATE', resolution, comment, category, (data1) => {
                let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                console.log(`[${timestamp}]: Resolution ["${resolution}"] was updated ["${comment}", "${category}"]`);
            });
        }
    });

    taskModel.ticketCategory((resolution) => {
        taskModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - Configurations";
            res.render('config', {MONTH: month, resolution: resolution, errors:{}, actionmsg: actionmsg});
        });
    });
};

function deleteResolution(req, res) {

    let actionmsg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                res.locals.title = "Ticket Tool - Configurations";
                res.render('config', {MONTH: month, resolution: resolution, errors: errors.mapped(), actionmsg: null});
            });
        });
        return;
    }

    var resolution = req.body.DESCRDEL;
    resolution = resolution.trim();

    taskModel.searchResolution(resolution, (result) => {
        if(result.length === 0) {
            actionmsg = "Resolution is not available to delete!"
            taskModel.ticketCategory((resolution) => {
                taskModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool - Configurations";
                    res.render('config', {MONTH: month, resolution: resolution, errors:{}, actionmsg: actionmsg});
                });
            });
            return;
        }

        taskModel.delResolution(resolution, (data) => {
            actionmsg = `Resolution "${resolution}" deleted successfully!`;
            taskModel.ticketCategory((resolution) => {
                taskModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool - Configurations";
                    res.render('config', {MONTH: month, resolution: resolution, errors:{}, actionmsg: actionmsg});
                });
            });
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Resolution ["${resolution}"] was deleted`);
        });
    });
};

function getResolutions(req, res) {

    taskModel.ticketCategory((result) => {
        taskModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - All Resolutions";
            res.render('allresolutions', {MONTH: month, result: result});
        })
    });
    let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
    console.log(`[${timestamp}]: Resolutions page was viewed`);
}

function insight_page (req, res) {
    res.render('insights');
};

function changelog_page (req, res) {
    res.render('changelogs');
};


module.exports = {
    index_page_get,
    index_page_post,
    exportAllCSV,
    search_ticket,
    exportSelectedMonth,
    getTicketData,
    configurations_get,
    newResolution_put,
    insight_page,
    search_page_update,
    changelog_page,
    getTicketDataAll,
    getTicketDataByCategory,
    getResolutions,
    deleteResolution,
    getExportPage,
    exportForRange
};


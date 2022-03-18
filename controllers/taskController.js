const taskModel = require('../models/taskModels');
const { validationResult } = require('express-validator');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');
require('../utils/writetoLogs');
const logfilePath = require('../utils/createLogfile');

const logfileName = logfilePath.filePath;
console.file(logfileName);

// let prevMON = moment.utc().subtract(1,'months').format('MMMYYYY');
// let curMON = moment.utc().format('MMMYYYY');

let app_nm = [{'name':'REPC'}, {'name':'TIGER'}, {'name':'RERT'}];
let users = [{'user':'Bharat'}, {'user':'Harish'}, {'user':'Keerthi'}, {'user':'Pragadeswar'}, {'user':'Saibhargavi'}, {'user':'Sucharitha'}, {'user':'Surandranath'}];


function index_page_get (req, res) {
    
    taskModel.ticketCategory((resolution) => {

        taskModel.getMonths((month) => {

            res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, errors:{}, MONTH: month});
        });
        
    });
    
};

function index_page_post (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        taskModel.ticketCategory((resolution) => {
            // console.log(resolution)
            taskModel.getMonths((month) => {
                res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, MONTH: month, errors:errors.mapped()});
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
        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Ticket "${TICKET}" contains character and app failed to post the data. [Responsible user: ${USER}]`);

        res.redirect('/ticket-tool');
        return;
    }

    taskModel.searchTicket(TICKET, (result) => {
        // console.log(result);
        if (result) {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${TICKET}" already exists and action failed to post the data`);

            res.send ("<head><link rel=\"icon\" type=\"image/png\"  href=\"/public/favicon/ticket64.png\"><title>Zoinks!</title><link rel=\"stylesheet\" href=\"/public/css/bootstrap.css\"><link rel=\"stylesheet\" href=\"/public/css/custom.css\"></head><nav class=\"navbar\"></nav><div class=\"container\"><a class=\"navbar-brand\" href=\"/ticket-tool\">TICKET TOOL</a><br><h3 class='subHeading'>TICKET <u>"+ TICKET +"</u> WAS ALREADY CATEGORIZED UNDER \"<u><i>"+ result.RESOLUTION.toUpperCase() +"</i></u>\" BY "+ result.RESOLVED_BY.toUpperCase() +"!</h3><a accesskey=\"0\" class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a></div>");
            // const err = new Error('Ticket already exist!');
            // err.statusCode = 404;
            // res.status(404).send({error: err.message});
            return;
        }

        taskModel.insertTicket(TICKET, DESCR, CATEGORY, COMMENT, USER, APP, timeGMT, MON, (result) => {
            // console.log(result);
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${TICKET}" logged in the application with data: ["${DESCR}", "${CATEGORY}", "${COMMENT}", "${USER}"]`);

            res.redirect('/ticket-tool');
        });
    });
};

function search_ticket (req, res) {

    const ticket = req.body.ticketnum;
    
    const xpressn = /^\s*$/;
    const ticketIsNull = xpressn.test(ticket);

    const errors = validationResult(req);

    if (ticketIsNull === true) {
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, MONTH: month, errors: errors.mapped()});
                
            });
        });
        return;
    }

    taskModel.searchTicket(ticket, (result) => {
        // console.log(result);
        if (!result) {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${ticket}" was searched and not available in the application`);

            res.send ("<head><link rel=\"icon\" type=\"image/png\"  href=\"/public/favicon/ticket64.png\"><title>Zoinks!</title><link rel=\"stylesheet\" href=\"/public/css/bootstrap.css\"><link rel=\"stylesheet\" href=\"/public/css/custom.css\"></head><nav class=\"navbar\"></nav><div class=\"container\"><a class=\"navbar-brand\" href=\"/ticket-tool\">TICKET TOOL</a><br><H3 class='subHeading'>TICKET \""+ ticket +"\" DOES NOT EXIST!</H3><a accesskey=\"0\" class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a></div>");
            return;
        }
        
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                console.log(`[${timestamp}]: Ticket "${ticket}" was searched in the application`);

                res.render('search', {resolution: resolution, result: result, MONTH: month, errors: {}});
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
                    res.render('search', {resolution: resolution, result: value, app_nm: app_nm, users_:users, MONTH: month, errors: errors.mapped()});
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

                    res.render('search', {resolution: resolution, result: value, app_nm: app_nm, users_:users, MONTH: month, errors:{}});
                });
            });
        });
        
    });

};

let monthForCat; 

function getTicketData (req, res) {

    const MON = req.body.viewMONTH;
    monthForCat = MON;

    taskModel.getData(MON, (result) => {
        
        taskModel.getMonths((month) => {
            taskModel.incidentCount(MON, (i_count) => {
                taskModel.requestCount(MON, (r_count) => {
                    let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
                    console.log(`[${timestamp}]: Viewed ticket details for month: ${MON}`);

                    res.render('viewdata', {result: result, MONTH: month, MON: MON, i_count: i_count, r_count: r_count});
                });
            });
        });
    });
};

function getTicketDataByCategory (req, res) {

    taskModel.getDataByCategory(monthForCat, (result) => {
        taskModel.getMonths((month) => {
            res.render('viewdataByCat', {MONTH: month, MON: monthForCat, result: result});

            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Viewed ticket details by category for month: ${monthForCat}`);
        });
    })
}

function getTicketDataAll (req, res) {

    taskModel.getAllData((result) => {
        taskModel.getMonths((month) => {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Viewed ticket details for all months`);

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
            res.send("<head><link rel=\"icon\" type=\"image/png\"  href=\"/public/favicon/ticket64.png\"><title>Ticket Tool-Export</title><link rel=\"stylesheet\" href=\"/public/css/bootstrap.css\"><link rel=\"stylesheet\" href=\"/public/css/custom.css\"></head><a href='/public/exports/"+ filename +"' download='"+ filename +"' id='download-link'></a><script>document.getElementById('download-link').click();</script><br><div class=\"container\"><a class=\"navbar-brand\" href=\"/ticket-tool\">TICKET TOOL</a><br><H3>REPORT DOWNLOADED</H3><a accesskey=\"0\" class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a></div>");
        })
        .pipe(ws);

        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Exported data for all months`);
    });
};

function exportSelectedMonth (req, res) {

    const MON = req.body.MONTH;
    
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
            res.send("<head><link rel=\"icon\" type=\"image/png\"  href=\"/public/favicon/ticket64.png\"><title>Ticket Tool-Export</title><link rel=\"stylesheet\" href=\"/public/css/bootstrap.css\"><link rel=\"stylesheet\" href=\"/public/css/custom.css\"></head><a href='/public/exports/"+ filename +"' download='"+ filename +"' id='download-link'></a><script>document.getElementById('download-link').click();</script><br><div class=\"container\"><a class=\"navbar-brand\" href=\"/ticket-tool\">TICKET TOOL</a><br><H3>REPORT DOWNLOADED</H3><a accesskey=\"0\" class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a></div>");
        })
        .pipe(ws);

        let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
        console.log(`[${timestamp}]: Exported data for month: ${MON}`);
    });
};

function newResolution_get (req, res) {

    taskModel.ticketCategory((resolution) => {
        taskModel.getMonths((month) => {
            res.render('config', {MONTH: month, resolution: resolution, errors:{}});
        })
    });
};

const newCSV = async (filePath, resolution, comment, category) => {
    // This function will filter the old data and write a new CSV file
    // if "Resolution1" is already available and user configures it to "Resolution2"
    // Resolution1 will be filtered/removed and new CSV will be created and Resolution2 will be appended by resolutionToCSV()
    fs.readFile(filePath, 'utf8', (err, data) => {

        if (err) {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Error while deleting the row in csv file`);
        }
        
        let records = data.split('\n').map(line => line.split(','));
        let newRecords = records.filter(line => 
            (line[0]) !== resolution).join('\n');
        
        fs.writeFile(filePath, newRecords, (err) => {
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: TicketCategory.csv is filtered with new data`);
        });

        resolutionToCSV(filePath, resolution, comment, category);
    });

};

const resolutionToCSV = (filePath, resolution, comment, category) => {

    let ws = fs.createWriteStream(filePath, { flags: 'a' });
    fastcsv.
    write([{
            CATEGOTY: resolution, 
            COMMENT: comment,
            TYPE: category
        }], 
        { 
            headers:false, 
            includeEndRowDelimiter: true 
        }).pipe(ws);
    
    let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
    console.log(`[${timestamp}]: New resolution was configured ["${resolution}", "${comment}", "${category}"]`);
};

async function newResolution_put (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        taskModel.ticketCategory((resolution) => {
            taskModel.getMonths((month) => {
                res.render('config', {MONTH: month, resolution: resolution, errors: errors.mapped()});
            })
        });        
        return;
    };

    const resolution = req.body.DESCR;
    var comment = req.body.COMMENT;
    const category = req.body.CATEGORY;
    const filePath = path.resolve(__dirname, '../', 'category', 'ticketCategory.csv');
    // console.log(resolution, filePath);

    // if the comment is not passed, value is set as NA by default
    if (!comment) {
        comment = 'NA'
    }

    newCSV(filePath, resolution, comment, category); 
    
    taskModel.ticketCategory((resolution) => {
        taskModel.getMonths((month) => {
            res.render('config', {MONTH: month, resolution: resolution, errors:{}});
        })
    });

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
    newResolution_get,
    newResolution_put,
    insight_page,
    search_page_update,
    changelog_page,
    getTicketDataAll,
    getTicketDataByCategory
};


const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

const appModel = require('../models/appModel');
const { validationResult } = require('express-validator');
const moment = require('moment');
const fs = require('fs');
const fastcsv = require('fast-csv');
require('../utils/writetoLogs');
const logfilePath = require('../utils/createLogfile');
const conf = require('../config/configuration');
const { exportDirLink, exportFilePath } = require('../config/ioconfig');

const logfileName = logfilePath.filePath;
console.file(logfileName);

const getTime = () => String(moment.utc().format('YYYY/MM/DD hh:mm:ss')) + ' GMT';

async function index_page_get(req, res) {

    try {
        const resolution = await appModel.ticketCategoryNew();
        const month = await appModel.getMonthsNew();

        res.locals.title = "Ticket Tool";
        res.render('index', { resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors: {}, MONTH: month, actionmsg: null, filename: null });
    } catch (error) {
        console.log(`[${getTime()}]: controller:index_page_post function | error: ${error}`);
    }
};

async function index_page_post(req, res) {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {

            const resolution = await appModel.ticketCategoryNew();
            const month = await appModel.getMonthsNew();

            res.locals.title = "Ticket Tool";
            res.render('index', { resolution: resolution, app_nm: conf.app_nm, users_: conf.users, MONTH: month, errors: errors.mapped(), actionmsg: null, filename: null });
            return;
        }

        let postdata = {
            TICKET: req.body.Ticket,
            DESCR: req.body.DESCR,
            CATEGORY: req.body.CATEGORY,
            COMMENT: req.body.COMMENT,
            USER: req.body.USER,
            APP: req.body.APP,
            CREATED_ON: moment.utc().format('YYYY/MM/DD hh:mm:ss'),
            MON: moment.utc().format('MMMYYYY'),
        }

        /*
        // To check if the ticket no. contains any character or special characters
        const xpressn = /^[0-9]+$/;
        const checkValue = xpressn.test(TICKET);
    
        if (checkValue === false) {
            const actionmsg = "Ticket number contains (special) characters!";
    
            let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');
            console.log(`[${timestamp}]: Ticket "${TICKET}" contains character and action failed to post the data. [Responsible user: ${USER}]`);
    
            res.locals.title = "Ticket Tool";
            appModel.ticketCategory((resolution) => {
                appModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool";
                    res.render('index', {resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors:{}, MONTH: month, actionmsg: actionmsg, filename: null});
                });
            });
            return;
        }
        */

        const searchResult = await appModel.searchTicket(postdata.TICKET);

        if (searchResult) {
            console.log(`[${getTime()}]: Ticket "${postdata.TICKET}" already exists and action failed to post the data. [Responsible user: ${postdata.USER}]`);

            const actionmsg = `Ticket "${postdata.TICKET}" was already categorized under "${searchResult.RESOLUTION}" by "${searchResult.RESOLVED_BY}"`;

            const resolution = await appModel.ticketCategoryNew();
            const month = await appModel.getMonthsNew();

            res.locals.title = "Ticket Tool";
            res.render('index', { resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors: {}, MONTH: month, actionmsg: actionmsg, filename: null });
            return;
        }

        const insertData = await appModel.insertTicket(postdata);
        // console.log("Insert ticket --", result);
        console.log(`[${getTime()}]: Ticket "${postdata.TICKET}" logged in the application with data: ["${postdata.DESCR}", "${postdata.CATEGORY}", "${postdata.COMMENT}", "${postdata.USER}"] {${insertData}}`);

        res.locals.title = "Ticket Tool";
        res.redirect('/ticket-tool');

    } catch (error) {
        console.log(`[${getTime()}]: controller:index_page_post function | error: ${error}`);
    }
};

async function search_ticket(req, res) {

    try {
        const ticket = req.body.ticketnum;
        // to check if the ticket number is searched with null
        const xpressn = /^\s*$/;
        const ticketIsNull = xpressn.test(ticket);

        const resolution = await appModel.ticketCategoryNew();
        const month = await appModel.getMonthsNew();

        if (ticketIsNull === true) {

            const actionmsg = "Search with a ticket number!"
            res.locals.title = "Ticket Tool";
            res.render('index', { resolution: resolution, app_nm: conf.app_nm, users_: conf.users, MONTH: month, errors: {}, actionmsg: actionmsg, filename: null });
            return;
        }

        const result = await appModel.searchTicket(ticket);

        if (!result) {
            console.log(`[${getTime()}]: Ticket "${ticket}" was searched and not available in the application`);

            const actionmsg = `Ticket "${ticket}" does not exist!`;
            res.locals.title = "Ticket Tool";
            res.locals.title = "Ticket Tool";
            res.render('index', { resolution: resolution, app_nm: conf.app_nm, users_: conf.users, errors: {}, MONTH: month, actionmsg: actionmsg, filename: null });
            return;
        }

        console.log(`[${getTime()}]: Ticket "${ticket}" was searched in the application`);

        res.locals.title = "Ticket Tool - Search";
        res.render('search', { resolution: resolution, result: result, MONTH: month, errors: {}, actionmsg: null });

    } catch (error) {
        console.log(`[${getTime()}]: controller:search_ticket function | error: ${error}`);
    }
};

async function search_page_update(req, res) {

    try {
        const updateData = {
            TICKET: req.body.Ticket,
            DESCR: req.body.DESCR,
            CATEGORY: req.body.CATEGORY,
            COMMENT: req.body.COMMENT
        }

        const resolution = await appModel.ticketCategoryNew();
        const month = await appModel.getMonthsNew();

        errors = validationResult(req);
        if (!errors.isEmpty()) {
            const value = await appModel.searchTicket(updateData.TICKET);

            res.locals.title = "Ticket Tool - Search";
            res.render('search', { resolution: resolution, result: value, MONTH: month, errors: errors.mapped(), actionmsg: null });
            return;
        }

        const result_ = await appModel.updateTicket(updateData);
        const value_ = await appModel.searchTicket(updateData.TICKET);
        // console.log(result);
        console.log(`[${getTime()}]: Ticket "${updateData.TICKET}" was updated with data: ["${updateData.DESCR}", "${updateData.CATEGORY}","${updateData.COMMENT}"]`);
        const actionmsg = "Ticket detail updated successfully!"
        res.locals.title = "Ticket Tool - Search";
        res.render('search', { resolution: resolution, result: value_, MONTH: month, errors: {}, actionmsg: actionmsg });

    } catch (error) {
        console.log(`[${getTime()}]: controller:search_page_update function | error: ${error}`);
    }
};

let monthForCat;

async function getTicketData(req, res) {

    try {
        const MON = req.body.viewMONTH;
        monthForCat = MON;

        const month = await appModel.getMonthsNew();

        if (MON === 'All') {
            const result = await appModel.getAllData();

            console.log(`[${getTime()}]: Viewed ticket details for all months`);

            res.locals.title = "Ticket Tool - View all data";
            res.render('viewdata', { result: result, MONTH: month, MON: 'All Months', i_count: {}, r_count: {} });
            return;
        }

        const result = await appModel.getData(MON);
        const i_count = await appModel.incidentCount(MON);
        const r_count = await appModel.requestCount(MON);

        console.log(`[${getTime()}]: Viewed ticket details for month: [${MON}]`);

        res.locals.title = `Ticket Tool - View data for ${MON}`;
        res.render('viewdata', { result: result, MONTH: month, MON: MON, i_count: i_count, r_count: r_count });

    } catch (error) {
        console.log(`[${getTime()}]: controller:getTicketData function | error: ${error}`);
    }
};

async function getTicketDataByCategory(req, res) {

    try {
        const month = await appModel.getMonthsNew();
        const result = await appModel.getDataByCategory(monthForCat);

        res.locals.title = "Ticket Tool - View by Category";
        res.render('viewdataByCat', { MONTH: month, MON: monthForCat, result: result });

        console.log(`[${getTime()}]: Viewed ticket details by category for month: [${monthForCat}]`);
    } catch (error) {
        console.log(`[${getTime()}]: controller:getTicketDataByCategory function | error: ${error}`);
    }
};

// this function is obsolete and handled in getTicketData() with condition MON === "All"
// but endpoint '/ticket-tool/view-all' is still active
async function getTicketDataAll(req, res) {

    try {
        const month = await appModel.getMonthsNew();
        const result = await appModel.getAllData();

        console.log(`[${getTime()}]: Viewed ticket details for all months`);

        res.locals.title = "Ticket Tool - View all data";
        res.render('viewdata', { result: result, MONTH: month, MON: 'All Months', i_count: {}, r_count: {} });
    } catch (error) {
        console.log(`[${getTime()}]: controller:getTicketDataAll function | error: ${error}`);
    }
};

async function exportAllCSV(req, res) {

    try {
        const result = await appModel.exportAllCSV();
        const allMonths = await appModel.getAllDistinctMonthsNew();
        const months = await appModel.getMonthsNew();

        const filePath = exportFilePath;
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticketAll_' + time + '.csv';
        const endPath = filePath + exportDirLink + filename;
        // console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, { headers: true })
            .on("finish", () => {

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

                res.render('exportpage', { month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename });

            })
            .pipe(ws);

        console.log(`[${getTime()}]: Exported data for all months`);

    } catch (error) {
        console.log(`[${getTime()}]: controller:exportAllCSV function | error: ${error}`);
    }
};

async function exportSelectedMonth(req, res) {

    try {
        const MON = req.body.SELECTED_MON;
        const allMonths = await appModel.getAllDistinctMonthsNew();
        const months = await appModel.getMonthsNew();

        const result = await appModel.exportMonth(MON);

        const filePath = exportFilePath;
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticket_' + MON + '_' + time + '.csv';
        const endPath = filePath + exportDirLink + filename;
        // console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, { headers: true })
            .on("finish", () => {

                let month = [];
                let rev_month = [];
                for (let i = 0; i < months.length; i++) {
                    month.push(months[i]['MON']);
                    rev_month.push(months[i]['MON']);
                }
                rev_month = rev_month.reverse();

                const monthFrom = allMonths[allMonths.length - 1];
                const monthTo = allMonths[0];

                res.render('exportpage', { month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename });

            })
            .pipe(ws);

        console.log(`[${getTime()}]: Exported data for month: [${MON}]`);

    } catch (error) {
        console.log(`[${getTime()}]: controller:exportSelectedMonth function | error: ${error}`);
    }
};

async function getExportPage(req, res) {

    try {
        const allMonths = await appModel.getAllDistinctMonthsNew();
        const months = await appModel.getMonthsNew();

        let month = [];
        let rev_month = [];
        for (let i = 0; i < months.length; i++) {
            month.push(months[i]['MON']);
            rev_month.push(months[i]['MON']);
        }
        rev_month = rev_month.reverse();

        const monthFrom = allMonths[allMonths.length - 1];
        const monthTo = allMonths[0];

        res.render('exportpage', { month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: null });
    } catch (error) {
        console.log(`[${getTime()}]: controller:getExportPage function | error: ${error}`);
    }
}

function exportForRange(req, res) {

    const from = req.body.FROM;
    const to = req.body.TO;

    appModel.getMonths((result) => {
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
            appModel.getAllDistinctMonths((allMonths) => {
                const monthFrom = allMonths[allMonths.length - 1];
                const monthTo = allMonths[0];

                res.render('exportpage', { month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: 'FROM MONTH SHOULD BE LESS THAN TO MONTH!', filename: null });
            });

            return;
        }
        else {
            const monthRange = month.slice(indexofTo, indexOfFrom + 1);

            appModel.exportMonthRange(monthRange, (output) => {

                const filePath = exportFilePath;
                let time = moment.utc().format('YYYYMMDDhhmmss');
                const filename = 'ticket_rng_' + time + '.csv';
                const endPath = filePath + exportDirLink + filename;
                // console.log(endPath);

                var ws = fs.createWriteStream(endPath);
                fastcsv.write(output, { headers: true })
                    .on("finish", () => {

                        appModel.getAllDistinctMonths((allMonths) => {
                            const monthFrom = allMonths[allMonths.length - 1];
                            const monthTo = allMonths[0];

                            res.render('exportpage', { month: month, rev_month: rev_month, monthFrom: monthFrom, monthTo: monthTo, actionmsg: null, filename: filename });
                        });
                    })
                    .pipe(ws);
            });

            console.log(`[${getTime()}]: Exported data for month range: [${monthRange}]`);
        }
    });
}

function configurations_get(req, res) {

    appModel.ticketCategory((resolution) => {
        appModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - Configurations";
            res.render('config', { MONTH: month, resolution: resolution, errors: {}, actionmsg: null });
        });
    });
};

function newResolution_put(req, res) {

    let actionmsg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        appModel.ticketCategory((resolution) => {
            appModel.getMonths((month) => {
                res.locals.title = "Ticket Tool - Configurations";
                res.render('config', { MONTH: month, resolution: resolution, errors: errors.mapped(), actionmsg: null });
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

    appModel.searchResolution(resolution, (result) => {
        if (result.length === 0) {
            appModel.putResolution('INSERT', resolution, comment, category, (data) => {
                console.log(`[${getTime()}]: New resolution was configured ["${resolution}", "${comment}", "${category}"]`);
                return;
            });
        }
        else {
            appModel.putResolution('UPDATE', resolution, comment, category, (data1) => {
                console.log(`[${getTime()}]: Resolution ["${resolution}"] was updated ["${comment}", "${category}"]`);
            });
        }
    });

    appModel.ticketCategory((resolution) => {
        appModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - Configurations";
            res.render('config', { MONTH: month, resolution: resolution, errors: {}, actionmsg: actionmsg });
        });
    });
};

function deleteResolution(req, res) {

    let actionmsg;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        appModel.ticketCategory((resolution) => {
            appModel.getMonths((month) => {
                res.locals.title = "Ticket Tool - Configurations";
                res.render('config', { MONTH: month, resolution: resolution, errors: errors.mapped(), actionmsg: null });
            });
        });
        return;
    }

    var resolution = req.body.DESCRDEL;
    resolution = resolution.trim();

    appModel.searchResolution(resolution, (result) => {
        if (result.length === 0) {
            actionmsg = "Resolution is not available to delete!"
            appModel.ticketCategory((resolution) => {
                appModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool - Configurations";
                    res.render('config', { MONTH: month, resolution: resolution, errors: {}, actionmsg: actionmsg });
                });
            });
            return;
        }

        appModel.delResolution(resolution, (data) => {
            actionmsg = `Resolution "${resolution}" deleted successfully!`;
            appModel.ticketCategory((resolution) => {
                appModel.getMonths((month) => {
                    res.locals.title = "Ticket Tool - Configurations";
                    res.render('config', { MONTH: month, resolution: resolution, errors: {}, actionmsg: actionmsg });
                });
            });
            console.log(`[${getTime()}]: Resolution ["${resolution}"] was deleted`);
        });
    });
};

function getResolutions(req, res) {

    appModel.ticketCategory((result) => {
        appModel.getMonths((month) => {
            res.locals.title = "Ticket Tool - All Resolutions";
            res.render('allresolutions', { MONTH: month, result: result });
        })
    });
    console.log(`[${getTime()}]: Resolutions page was viewed`);
}

function insight_page(req, res) {
    res.render('insights');
};

function changelog_page(req, res) {
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
    exportForRange,

    // get '/' will redirect to tool
    appRedirect: (request, response) => {
        return response.redirect('/ticket-tool');
    },

    apiredirect: (request, response) => {
        console.log(`[${getTime()}]: API documentation page was viewed`);
        return response.redirect(`${process.env.API_SERVER_URL}:${process.env.API_SERVER_PORT}/api-docs`);
    }
};


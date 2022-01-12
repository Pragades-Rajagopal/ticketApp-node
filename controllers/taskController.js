const taskModel = require('../models/taskModels');
const { validationResult } = require('express-validator');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');

let prevMON = moment.utc().subtract(1,'months').format('MMMYYYY');

function index_page_get (req, res) {

    let app_nm = [{'name':'REPC'}, {'name':'TIGER'}, {'name':'RERT'}, {'name':'MSPS'}, {'name':'REACT'}];
    let users = [{'user':'Bharat'}, {'user':'Harish'}, {'user':'Pragadeswar'}, {'user':'Saibhargavi'}, {'user':'Sucharitha'}, {'user':'Surandranath'}];

    taskModel.ticketCategory((resolution) => {
        res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, prevMON:prevMON, errors:{}});
    });
    
};

function index_page_post (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.render('index', {errors : errors.mapped()});
        return res.redirect('/ticket-tool');
    }
    
    const TICKET = req.body.Ticket;
    const DESCR = req.body.DESCR;
    const CATEGORY = req.body.CATEGORY;
    const COMMENT = req.body.COMMENT;
    const USER = req.body.USER;
    const APP = req.body.APP;
    let timeGMT = moment.utc().format('YYYY/MM/DD hh:mm:ss');
    let MON = moment.utc().format('MMMYYYY');

    taskModel.insertTicket(TICKET, DESCR, CATEGORY, COMMENT, USER, APP, timeGMT, MON, (result) => {
        console.log(result);
        res.redirect('/ticket-tool');
    });
};

function exportAllCSV (req, res) {
    taskModel.exportAllCSV((result) => {
        console.log(result);

        const filePath = path.resolve(__dirname, '../', 'public');
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticketAll_' + time + '.csv';
        const endPath = filePath + '\\' + filename;
        console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, {headers:true})
        .on("finish", () => {
            res.send("<a href='/public/"+ filename +"' download='"+ filename +"' id='download-link'></a><script>document.getElementById('download-link').click();</script><h3>Report downloaded</h3><a href='/ticket-tool'>Go home</a>");
        })
        .pipe(ws);

    });
};


module.exports = {
    index_page_get,
    index_page_post,
    exportAllCSV
};


const taskModel = require('../models/taskModels');
const { validationResult } = require('express-validator');
const moment = require('moment');
const path = require('path');
const fs = require('fs');
const fastcsv = require('fast-csv');


let prevMON = moment.utc().subtract(1,'months').format('MMMYYYY');
let curMON = moment.utc().format('MMMYYYY');

let app_nm = [{'name':'REPC'}, {'name':'TIGER'}, {'name':'RERT'}, {'name':'MSPS'}, {'name':'REACT'}];
let users = [{'user':'Bharat'}, {'user':'Harish'}, {'user':'Pragadeswar'}, {'user':'Saibhargavi'}, {'user':'Sucharitha'}, {'user':'Surandranath'}];

// non functional now
const getTicketCount = () => {
    taskModel.getCount(curMON, (result) => {
        return result;
    });
};

function index_page_get (req, res) {

    taskModel.ticketCategory((resolution) => {
        res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, prevMON:prevMON.toUpperCase(), curMON: curMON.toUpperCase(), errors:{}});
    });
    
};

function index_page_post (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        
        taskModel.ticketCategory((resolution) => {
            res.render('index', {resolution: resolution, app_nm: app_nm, users_:users, prevMON:prevMON.toUpperCase(), curMON: curMON.toUpperCase(), errors:errors.mapped()});
            
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

    taskModel.searchTicket(TICKET, (result) => {
        // console.log(result);
        if (result) {
            res.send ("<h2 class='subHeading'>Ticket "+ TICKET +" already exist!!</h2><a class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a>");
            // const err = new Error('Ticket already exist!');
            // err.statusCode = 404;
            // res.status(404).send({error: err.message});
            return;
        }

        taskModel.insertTicket(TICKET, DESCR, CATEGORY, COMMENT, USER, APP, timeGMT, MON, (result) => {
            // console.log(result);
            res.redirect('/ticket-tool');
        });
    });
};

function search_ticket (req, res) {

    const ticket = req.body.ticketnum;

    taskModel.searchTicket(ticket, (result) => {
        // console.log(result);
        if (!result) {
            res.send ("<H2 class='subHeading'>Ticket "+ ticket +" does not exist!!</H2><a class=\"btn btn-outline-dark cancel\" href='/ticket-tool'>GO HOME</a>");
            return;
        }
        
        res.render('search', {result: result, curMON: curMON.toUpperCase(), prevMON:prevMON.toUpperCase()});
    });

};

function getTicketData (req, res) {

    taskModel.getData(curMON, (result) => {
        res.render('viewdata', {result: result, prevMON: prevMON.toUpperCase(), curMON: curMON.toUpperCase()});
    });
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
            res.send("<a href='/public/exports/"+ filename +"' download='"+ filename +"' id='download-link'></a><script>document.getElementById('download-link').click();</script><h3>Report downloaded</h3><a class='btn btn-outline-dark cancel' href='/ticket-tool'>Go home</a>");
        })
        .pipe(ws);

    });
};

function exportPrevMon (req, res) {
    
    taskModel.exportPrevious(prevMON, (result) => {
        // console.log(result);

        const filePath = path.resolve(__dirname, '../', 'public', 'exports');
        let time = moment.utc().format('YYYYMMDDhhmmss');
        const filename = 'ticket_'+ prevMON +'_' + time + '.csv';
        const endPath = filePath + '\\' + filename;
        // console.log(endPath);

        var ws = fs.createWriteStream(endPath);
        fastcsv.write(result, {headers:true})
        .on("finish", () => {
            res.send("<a href='/public/exports/"+ filename +"' download='"+ filename +"' id='download-link'></a><script>document.getElementById('download-link').click();</script><h3>Report downloaded</h3><a class='btn btn-outline-dark cancel' href='/ticket-tool'>Go home</a>");
        })
        .pipe(ws);
    });
};

function newResolution_get (req, res) {

    res.render('config', {curMON: curMON.toUpperCase(), prevMON: prevMON.toUpperCase(), errors:{}});
};

function newResolution_put (req, res) {

    const resolution = req.body.DESCR;
    const filePath = path.resolve(__dirname, '../', 'category', 'ticketCategory.csv');
    // console.log(resolution, filePath);
    
    let ws = fs.createWriteStream(filePath, { flags: 'a' });
    fastcsv.
    write([
        {CATEGOTY: resolution}
        ], 
        { headers:false, 
        includeEndRowDelimiter: true })
        .pipe(ws);
    
    res.render('config', {curMON: curMON.toUpperCase(), prevMON: prevMON.toUpperCase(), errors:{}});    
}

function insight_page (req, res) {
    res.render('insights');
};


module.exports = {
    index_page_get,
    index_page_post,
    exportAllCSV,
    search_ticket,
    exportPrevMon,
    getTicketData,
    newResolution_get,
    newResolution_put,
    insight_page
};


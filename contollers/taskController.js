const taskModel = require('../models/taskModels');
const moment = require('moment');

function index_page_get (req, res) {

    let app_nm = [{'name':'REPC'}, {'name':'TIGER'}, {'name':'RERT'}, {'name':'MSPS'}, {'name':'REACT'}];
    let users = [{'user':'Bharat'}, {'user':'Harish'}, {'user':'Pragadeswar'}, {'user':'Saibhargavi'}, {'user':'Sucharitha'}, {'user':'Surandranath'}];

    taskModel.ticketCategory((resolution) => {
        res.render('index', {resolution: resolution, app_nm: app_nm, users_:users});
    });
};

function index_page_post (req, res) {
    
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


module.exports = {
    index_page_get,
    index_page_post
};


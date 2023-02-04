const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const appRoutes = require('./routes/appRoutes');
const moment = require('moment');
require('./utils/writetoLogs');
const logfilePath = require('./utils/createLogfile');

const logfileName = logfilePath.filePath;
console.file(logfileName);

const port = 9191;
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(__dirname + "/public"));

app.get('/check', (req, res) => {
    res.send('Testing...');
});

app.use(appRoutes);

let timestamp = moment.utc().format('YYYY/MM/DD hh:mm:ss');

app.listen(port, () => {
    console.log(`[${timestamp}]: Application is running in port: ${port}`);
});


const startTime = Date.now();
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const express = require('express');
const bodyParser = require('body-parser');
const appRoutes = require('./routes/appRoutes');
const moment = require('moment');
require('./utils/writetoLogs');
const logfilePath = require('./utils/createLogfile');

const logfileName = logfilePath.filePath;
console.file(logfileName);

const PORT = process.env.PORT;
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

const getTime = () => String(moment().utcOffset("+05:30").format('YYYY/MM/DD hh:mm:ss')) + ' IST';

app.listen(PORT, () => {
    console.log(`[${getTime()}]: Application is running in port: ${PORT}`);
    const stopTime = Date.now();
    const elapsedTime = (stopTime - startTime) / 1000;
    console.log(`[${getTime()}]: Application startup time: ${elapsedTime}s`);
});


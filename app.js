const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const taskRoutes = require('./routes/taskRoutes')

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:false}));

app.get('/check', (req, res) => {
    res.send('Testing...');
});

app.use(taskRoutes);

app.listen(8000, () => {
    console.log('server running in port:8000');
});


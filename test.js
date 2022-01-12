const moment = require('moment');

let utc = moment.utc().format('YYYY/MM/DD hh:mm:ss');
let prevMON = moment.utc().subtract(1,'months').format('MMMYYYY');

console.log(utc);
console.log(MON);

// const path = require('path');
// // // console.log(path.resolve(__dirname, 'database', 'data.sqlite3'));
// const filePath = path.resolve(__dirname, 'public');
// console.log(filePath);
// let time = moment.utc().format('YYYYMMDDhhmmss');
// const filename = 'ticketAll_' + time + '.csv';
// const endPath = filePath + '\\' + filename;
// console.log(endPath);

// var cat = [];
// const csv = require('csv-parser');
// const fs = require('fs');
// const file = path.resolve(__dirname, 'category', 'ticketCategory.csv');
// fs.createReadStream(file).pipe(csv()).on('data', (row)=> {
//     cat.push(row);
// }).on('end', () => {
//     console.log(cat);
// });

// console.log(cat);

// var express = require("express");
// var app = express();
// var http = require("http").createServer(app);
// var fileSystem = require("fs");
// var fastcsv = require("fast-csv");
 
// app.use("/public", express.static(__dirname + "/public"));
 
// http.listen(3000, function () {
//     console.log("Connected");
 
//     app.get("/exportData", function (request, result) {
 
//         var data = [{
//             "id": 1,
//             "name": "Max",
//             "age": 29
//         }, {
//             "id": 2,
//             "name": "Alexi",
//             "age": 31
//         }, {
//             "id": 3,
//             "name": "Murdoch",
//             "age": 33
//         }];
 
//         var ws = fileSystem.createWriteStream("public/data.csv");
//         fastcsv
//             .write(data, { headers: true })
//             .on("finish", function() {
 
//                 result.send("<a href='/public/data.csv' download='data.csv' id='download-link'></a><script>document.getElementById('download-link').click();</script><a href='#'>Export for previous month</a>");
//             })
//             .pipe(ws);
//     });
// });


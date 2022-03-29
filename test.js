// const moment = require('moment');

// // let utc = moment.utc().format('YYYY/MM/DD hh:mm:ss');
// let prevMON = moment.utc().subtract(1,'months').format('MMMYYYY');

// let months = []

// for (let i = 0; i < 12; i++) {
//     months.push(
//          {month: moment.utc().subtract(i,'months').format('MMMYYYY')}
//     );
// }

// let newData = []

// for (let i = 0; i < months.length; i++) {
//     newData.push(months[i]['month']);
// }

// let from = newData.indexOf("Jan2022");
// let to = newData.indexOf("Aug2021");

// let result = newData.slice(from, to+1)

// console.log(newData.reverse())
// console.log(months);

let list = [ 'Mar2022', 'Feb2022', 'Jan2022', 'Dec2021', 'Nov2021' ];
const array = list[list.length - 1];
console.log(array)
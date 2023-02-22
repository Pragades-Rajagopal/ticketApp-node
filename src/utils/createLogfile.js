const fs = require('fs');
const path = require('path');
const moment = require('moment');

let time = moment().utcOffset("+05:30").format('YYYYMMDDhhmm');

const fileName = 'log_' + time + '.txt';
const filePath = path.resolve(__dirname, '../../logs', fileName);

fs.writeFileSync(filePath.toString(), `---${time}---`);

module.exports = { filePath };

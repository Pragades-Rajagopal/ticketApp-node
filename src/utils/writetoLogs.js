const fs = require('fs');
const { keys } = Object;
const { Console } = console;

function file (path) {
    const con = new Console(fs.createWriteStream(path));

    keys(Console.prototype).forEach(key => {
        this[key] = (...args) => con[key](...args);
    });
};

module.exports = console.file = file;


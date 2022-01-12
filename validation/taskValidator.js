const { check } = require('express-validator');

exports.validateTask = [
    check('Ticket')
    .isLength({min:1})
    .withMessage("Ticket number is mandatory"),

    check('DESCR')
    .isLength({min:1})
    .withMessage("Ticket description is mandatory"),

    check('COMMENT')
    .isLength({min:1})
    .withMessage("Detailed desctiption is mandatory. Mention NA")
];


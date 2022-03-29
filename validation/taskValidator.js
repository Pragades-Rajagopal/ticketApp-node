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
    .withMessage("Detailed description is mandatory. Mention NA"),

    check('USER')
    .isLength({min:1})
    .withMessage("Resolved by is mandatory"),

    check('APP')
    .isLength({min:1})
    .withMessage("Application name is mandatory"),

    check('CATEGORY')
    .isLength({min:1})
    .withMessage("Ticket category is mandatory")
];

exports.configValidation = [
    check('DESCR')
    .isLength({min:1})
    .withMessage("New resolution is mandatory"),
    check('CATEGORY')
    .isLength({min:1})
    .withMessage("Ticket category is mandatory")
];

exports.deleteResolution = [
    check('DESCRDEL')
    .isLength({min:1})
    .withMessage("Enter the resolution to delete")
];

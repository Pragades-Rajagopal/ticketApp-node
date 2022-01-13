const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const taskValidator = require('../validation/taskValidator');

router.get('/ticket-tool', taskController.index_page_get);
router.post('/ticket-tool', taskValidator.validateTask, taskController.index_page_post);
router.get('/ticket-tool/exportAll', taskController.exportAllCSV);
router.post('/ticket-tool/search', taskController.search_ticket);
router.get('/ticket-tool/export', taskController.exportPrevMon);

module.exports = router;


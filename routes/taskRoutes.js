const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const taskValidator = require('../validation/taskValidator');

router.get('/ticket-tool', taskController.index_page_get);
router.post('/ticket-tool', taskValidator.validateTask, taskController.index_page_post);
router.get('/ticket-tool/exportAll', taskController.exportAllCSV);
router.post('/ticket-tool/search', taskController.search_ticket);
router.post('/ticket-tool/export', taskController.exportSelectedMonth);
router.post('/ticket-tool/viewdata', taskController.getTicketData);
router.get('/ticket-tool/config', taskController.newResolution_get);
router.post('/ticket-tool/config', taskValidator.configValidation, taskController.newResolution_put);
router.get('/ticket-tool/v1/insights', taskController.insight_page);
router.post('/ticket-tool/search/update', taskValidator.validateTask, taskController.search_page_update);
router.get('/ticket-tool/v1/changelogs', taskController.changelog_page);

module.exports = router;


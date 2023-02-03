const express = require('express');
const router = express.Router();
const taskController = require('../controllers/appController');
const taskValidator = require('../validation/validator');

router.get('/ticket-tool', taskController.index_page_get);
router.post('/ticket-tool', taskValidator.validateTask, taskController.index_page_post);
router.get('/ticket-tool/export-data/exportAll', taskController.exportAllCSV);
router.post('/ticket-tool/search', taskController.search_ticket);
router.post('/ticket-tool/export', taskController.exportSelectedMonth);
router.post('/ticket-tool/viewdata', taskController.getTicketData);
router.get('/ticket-tool/viewdata/category', taskController.getTicketDataByCategory);
router.get('/ticket-tool/view-all', taskController.getTicketDataAll);
router.get('/ticket-tool/config', taskController.configurations_get);
router.post('/ticket-tool/config', taskValidator.configValidation, taskController.newResolution_put);
router.get('/ticket-tool/v/insights', taskController.insight_page);
router.post('/ticket-tool/search/update', taskValidator.validateTask, taskController.search_page_update);
router.get('/ticket-tool/v/changelogs', taskController.changelog_page);
router.get('/ticket-tool/config/view-resolutions', taskController.getResolutions);
router.post('/ticket-tool/config/delete', taskValidator.deleteResolution, taskController.deleteResolution);
router.get('/ticket-tool/export-data', taskController.getExportPage);
router.post('/ticket-tool/export-data', taskController.exportForRange);

module.exports = router;


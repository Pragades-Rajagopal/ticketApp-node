const express = require('express');
const router = express.Router();
const appController = require('../controllers/appController');
const appValidator = require('../validation/validator');

router.get('/ticket-tool', appController.index_page_get);
router.post('/ticket-tool', appValidator.validateTask, appController.index_page_post);
router.get('/ticket-tool/export-data/exportAll', appController.exportAllCSV);
router.post('/ticket-tool/search', appController.search_ticket);
router.post('/ticket-tool/export', appController.exportSelectedMonth);
router.post('/ticket-tool/viewdata', appController.getTicketData);
router.get('/ticket-tool/viewdata/category', appController.getTicketDataByCategory);
router.get('/ticket-tool/view-all', appController.getTicketDataAll);
router.get('/ticket-tool/config', appController.configurations_get);
router.post('/ticket-tool/config', appValidator.configValidation, appController.newResolution_put);
router.get('/ticket-tool/v/insights', appController.insight_page);
router.post('/ticket-tool/search/update', appValidator.validateTask, appController.search_page_update);
router.get('/ticket-tool/v/changelogs', appController.changelog_page);
router.get('/ticket-tool/config/view-resolutions', appController.getResolutions);
router.post('/ticket-tool/config/delete', appValidator.deleteResolution, appController.deleteResolution);
router.get('/ticket-tool/export-data', appController.getExportPage);
router.post('/ticket-tool/export-data', appController.exportForRange);

router.get('/', appController.appRedirect);
router.get('/ticket-tool/api-documentation/redirect', appController.apiredirect);

module.exports = router;


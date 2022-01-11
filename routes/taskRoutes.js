const express = require('express');
const router = express.Router();
const taskController = require('../contollers/taskController');

router.get('/ticket-tool', taskController.index_page_get);
router.post('/ticket-tool', taskController.index_page_post);


module.exports = router;


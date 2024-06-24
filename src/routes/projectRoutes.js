const express = require('express');
const router = express.Router();
const projectController = require('../contollers/projectController');

router.get('/getAllProjects', projectController.getAllProjects);
router.get('/getWorkItems', projectController.getWorkItems);
router.post('/getWorkItemHistory', projectController.getWorkItemHistory);
router.get('/getTotalWorkItem', projectController.getTotalWorkItems);
router.post('/getProjectWorkItems', projectController.getProjectWorkItems);

module.exports = router;
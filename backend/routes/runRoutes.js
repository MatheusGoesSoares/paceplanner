const express = require('express');
const router = express.Router();

const runController = require('../controllers/runController');

router.get('/', runController.listRuns);

router.get('/:id', runController.getRunById);

router.post('/', runController.createRun);

router.put('/:id', runController.updateRun);

router.delete('/:id', runController.deleteRun);

module.exports = router;
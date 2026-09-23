const express = require('express');
const router = express.Router();
const streakController = require('../controllers/streakController');

router.get('/', streakController.getStreak);
router.post('/record-visit', streakController.recordVisit);
router.put('/sync', streakController.syncStreak);

module.exports = router;

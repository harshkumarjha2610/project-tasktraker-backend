const express = require('express');
const router = express.Router();
const {
  getPomodoroData,
  updatePomodoroSettings,
  addPomodoroSession,
  addWasteSession,
  syncPomodoroData,
  clearPomodoroHistory,
  updateActiveTimer,
  updateStandaloneWaste,
} = require('../controllers/pomodoroController');

router.route('/')
  .get(getPomodoroData);

router.put('/sync', syncPomodoroData);
router.put('/settings', updatePomodoroSettings);
router.put('/active-timer', updateActiveTimer);
router.put('/standalone-waste', updateStandaloneWaste);
router.post('/session', addPomodoroSession);
router.post('/waste', addWasteSession);
router.delete('/history', clearPomodoroHistory);

module.exports = router;

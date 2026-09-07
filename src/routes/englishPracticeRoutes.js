const express = require('express');
const router = express.Router();
const {
  getPracticeLogs,
  createPracticeLog,
  updatePracticeLog,
  deletePracticeLog,
} = require('../controllers/englishPracticeController');

router.route('/')
  .get(getPracticeLogs)
  .post(createPracticeLog);

router.route('/:id')
  .put(updatePracticeLog)
  .delete(deletePracticeLog);

module.exports = router;

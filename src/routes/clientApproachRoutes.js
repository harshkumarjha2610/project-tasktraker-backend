const express = require('express');
const router = express.Router();
const {
  getApproaches,
  createApproach,
  updateApproach,
  deleteApproach,
} = require('../controllers/clientApproachController');

router.route('/')
  .get(getApproaches)
  .post(createApproach);

router.route('/:id')
  .put(updateApproach)
  .delete(deleteApproach);

module.exports = router;

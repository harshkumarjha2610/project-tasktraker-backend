const express = require('express');
const router  = express.Router();
const {
  getTasks, getStats, getTask,
  createTask, updateTask, toggleTask,
  deleteTask, deleteManyTasks,
} = require('../controllers/taskController');

// Stats (must come before /:id to avoid conflict)
router.get('/stats', getStats);

// Collection routes
router.route('/')
  .get(getTasks)
  .post(createTask)
  .delete(deleteManyTasks);   // bulk delete: { ids: [...] }

// Single resource routes
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// Toggle done/todo
router.patch('/:id/toggle', toggleTask);

module.exports = router;

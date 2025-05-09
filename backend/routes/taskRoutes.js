const express = require('express');
const router = express.Router();
const {
  getWorkerTasks,
  updateTaskStatus,
  createTask,
  getAllTasks,
  getTasksByWorker,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { isAdmin } = require('../middleware/admin');

// Task routes for workers
router.get('/', protect, getWorkerTasks);
router.put('/:id/status', protect, updateTaskStatus);

// Admin task routes
router.post('/admin/tasks', protect, isAdmin, createTask);
router.get('/admin/tasks', protect, isAdmin, getAllTasks);
router.get('/admin/tasks/worker/:workerId', protect, isAdmin, getTasksByWorker);
router.put('/admin/tasks/:id', protect, isAdmin, updateTask);
router.delete('/admin/tasks/:id', protect, isAdmin, deleteTask);

module.exports = router;

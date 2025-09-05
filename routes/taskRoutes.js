const express = require('express');
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Authenticated routes
router.use(authMiddleware);

// CRUD routes
router.post('/', createTask);
router.get('/', getTasks);
router.put('/:id', updateTask);

// Delete route: admin can delete any, user can delete own
router.delete('/:id', deleteTask);

module.exports = router;

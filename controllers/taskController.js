const taskModel = require('../models/taskModel');
const logger = require('../utils/logger');

async function createTask(req, res, next) {
  try {
    const { title, description, status } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const userId = req.user.id;
    const insertId = await taskModel.createTask({ title, description, status, userId });

    logger.info('Task created: id=%d by user=%d', insertId, userId);
    res.status(201).json({ message: 'Task created', id: insertId });
  } catch (err) {
    next(err);
  }
}

async function getTasks(req, res, next) {
  try {
    const { search = '', status = 'All', sort = 'newest' } = req.query;
    if (req.user.role === 'admin') {
      const tasks = await taskModel.getAllTasks({ search, status, sort });
      return res.json(tasks);
    } else {
      const tasks = await taskModel.getTasksByUser(req.user.id, { search, status, sort });
      return res.json(tasks);
    }
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { title, description, status } = req.body;
    const userId = req.user.id;

    const affected = await taskModel.updateTask({ id, title, description, status, userId });
    if (!affected) return res.status(403).json({ error: 'Not authorized or task not found' });

    logger.info('Task updated: id=%d by user=%d', id, userId);
    res.json({ message: 'Task updated' });
  } catch (err) {
    next(err);
  }
}

async function deleteTask(req, res, next) {
  try {
    const id = Number(req.params.id);
    const userId = req.user.id;
    const userRole = req.user.role;

    // Admin can delete any task
    if (userRole === 'admin') {
      const affected = await taskModel.deleteTaskById(id);
      if (!affected) return res.status(404).json({ error: 'Task not found' });
      logger.info('Admin deleted task id=%d', id);
      return res.json({ message: 'Task deleted' });
    }

    // Regular user: can delete own task only
    const affected = await taskModel.deleteTask({ id, userId });
    if (!affected) return res.status(403).json({ error: 'Not authorized or task not found' });

    logger.info('Task deleted: id=%d by user=%d', id, userId);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTask, getTasks, updateTask, deleteTask };

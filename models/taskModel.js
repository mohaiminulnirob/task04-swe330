const pool = require('../config/db');

async function createTask({ title, description = '', status = 'To Do', userId }) {
  const sql = 'INSERT INTO tasks (title, description, status, user_id) VALUES (?, ?, ?, ?)';
  const [res] = await pool.query(sql, [title, description, status, userId]);
  return res.insertId;
}

async function getTasksByUser(userId, { search = '', status = 'All', sort = 'newest' } = {}) {
  let sql = 'SELECT * FROM tasks WHERE user_id = ?';
  const params = [userId];

  if (status && status !== 'All') {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  // simple sort mapping
  switch (sort) {
    case 'newest':
      sql += ' ORDER BY created_at DESC';
      break;
    case 'oldest':
      sql += ' ORDER BY created_at ASC';
      break;
    case 'title':
      sql += ' ORDER BY title ASC';
      break;
    case 'status':
      sql += " ORDER BY FIELD(status,'To Do','In Progress','Completed')";
      break;
    default:
      sql += ' ORDER BY created_at DESC';
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function getAllTasks({ search = '', status = 'All', sort = 'newest' } = {}) {
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (status && status !== 'All') {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  switch (sort) {
    case 'newest': sql += ' ORDER BY created_at DESC'; break;
    case 'oldest': sql += ' ORDER BY created_at ASC'; break;
    case 'title': sql += ' ORDER BY title ASC'; break;
    case 'status': sql += " ORDER BY FIELD(status,'To Do','In Progress','Completed')"; break;
    default: sql += ' ORDER BY created_at DESC';
  }

  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findTaskById(id) {
  const sql = 'SELECT * FROM tasks WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

async function updateTask({ id, title, description, status, userId }) {
  const sql = 'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?';
  const [res] = await pool.query(sql, [title, description, status, id, userId]);
  return res.affectedRows;
}

async function deleteTask({ id, userId }) {
  const sql = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
  const [res] = await pool.query(sql, [id, userId]);
  return res.affectedRows;
}

// Delete task by id (admin)
async function deleteTaskById(id) {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  const [res] = await pool.query(sql, [id]);
  return res.affectedRows;
}


module.exports = {
  createTask,
  getTasksByUser,
  getAllTasks,
  findTaskById,
  updateTask,
  deleteTask,
  deleteTaskById
};

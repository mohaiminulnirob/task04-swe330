const pool = require('../config/db');

// create user (returns insertId)
async function createUser({ username, email, passwordHash, role = 'user' }) {
  const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
  const [result] = await pool.query(sql, [username, email, passwordHash, role]);
  return result.insertId;
}

async function findByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const [rows] = await pool.query(sql, [email]);
  return rows[0];
}

async function findByUsername(username) {
  const sql = 'SELECT * FROM users WHERE username = ?';
  const [rows] = await pool.query(sql, [username]);
  return rows[0];
}

async function findById(id) {
  const sql = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

module.exports = { createUser, findByEmail, findByUsername, findById };

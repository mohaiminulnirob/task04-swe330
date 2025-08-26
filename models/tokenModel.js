const pool = require('../config/db');

// token record is used for password resets
async function createPasswordResetToken({ userId, token, expiresAt }) {
  const sql = 'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)';
  const [res] = await pool.query(sql, [userId, token, expiresAt]);
  return res.insertId;
}

async function findValidToken(token) {
  const sql = 'SELECT pr.*, u.email FROM password_resets pr JOIN users u ON pr.user_id = u.id WHERE pr.token = ? AND pr.expires_at > NOW()';
  const [rows] = await pool.query(sql, [token]);
  return rows[0];
}

async function deleteTokenById(id) {
  const sql = 'DELETE FROM password_resets WHERE id = ?';
  const [res] = await pool.query(sql, [id]);
  return res.affectedRows;
}

module.exports = { createPasswordResetToken, findValidToken, deleteTokenById };

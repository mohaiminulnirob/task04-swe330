const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
const { sendPasswordResetEmail } = require('../utils/mailer');

require('dotenv').config();

async function register(req, res, next) {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });

    // unique checks
    const existingEmail = await userModel.findByEmail(email);
    if (existingEmail) return res.status(400).json({ error: 'Email already registered' });
    const existingUsername = await userModel.findByUsername(username);
    if (existingUsername) return res.status(400).json({ error: 'Username already taken' });

    const hash = await bcrypt.hash(password, 10);
    const insertId = await userModel.createUser({ username, email, passwordHash: hash, role: role || 'user' });

    logger.info('User registered: %s (id=%d)', username, insertId);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await userModel.findByEmail(email);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });

    logger.info('User logged in: %s (id=%d)', user.email, user.id);
    res.json({ token });
  } catch (err) {
    next(err);
  }
}

// Request password reset: create token, store, send email
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await userModel.findByEmail(email);
    if (!user) {
      // Don't reveal whether email exists; respond 200 anyway
      return res.json({ message: 'If the email exists, you will receive password reset instructions.' });
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await tokenModel.createPasswordResetToken({ userId: user.id, token, expiresAt });

    // send email
    try {
      await sendPasswordResetEmail(user.email, token);
      logger.info('Password reset email sent to %s', user.email);
    } catch (mailErr) {
      logger.error('Failed to send password reset email: %o', mailErr);
      // still respond success to avoid leaking
    }

    res.json({ message: 'If the email exists, you will receive password reset instructions.' });
  } catch (err) {
    next(err);
  }
}

// Reset password using token
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });

    const record = await tokenModel.findValidToken(token);
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, 10);
    // update user password
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    const db = require('../config/db');
    // db is a pool
    await db.query(sql, [hashed, record.user_id]);

    // delete token
    await tokenModel.deleteTokenById(record.id);
    logger.info('Password reset for user_id=%d', record.user_id);

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, requestPasswordReset, resetPassword };

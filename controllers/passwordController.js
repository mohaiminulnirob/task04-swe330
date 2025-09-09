const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const userModel = require('../models/userModel');
const tokenModel = require('../models/tokenModel');
const { sendPasswordResetEmail } = require('../utils/mailer');
const db = require('../config/db');

// Request reset
async function requestPasswordReset(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await userModel.findByEmail(email);
    if (!user) return res.json({ message: 'If the email exists, you will receive reset instructions.' });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await tokenModel.createPasswordResetToken({ userId: user.id, token, expiresAt });

    await sendPasswordResetEmail(user.email, token).catch(err =>
      logger.error('Mail error: %o', err)
    );

    res.json({ message: 'If the email exists, you will receive reset instructions.' });
  } catch (err) {
    next(err);
  }
}

// Reset password
async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });

    const record = await tokenModel.findValidToken(token);
    if (!record) return res.status(400).json({ error: 'Invalid or expired token' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, record.user_id]);
    await tokenModel.deleteTokenById(record.id);

    logger.info('Password reset for user_id=%d', record.user_id);
    res.json({ message: 'Password has been reset' });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestPasswordReset, resetPassword };

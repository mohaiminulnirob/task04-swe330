const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

const userModel = require('../models/userModel');

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

module.exports = { register, login};
const express = require('express');
const { register, login} = require('../controllers/authController');
const { requestPasswordReset, resetPassword } = require('../controllers/passwordController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);

module.exports = router;

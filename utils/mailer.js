const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// verify transporter quickly
transporter.verify().then(() => {
  console.log('SMTP transporter is ready');
}).catch(err => {
  console.warn('SMTP transporter verify failed: (emails may not be sent)', err.message);
});

async function sendPasswordResetEmail(toEmail, token) {
  const resetLink = `${process.env.APP_BASE_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: toEmail,
    subject: 'Password Reset - Task Manager',
    text: `You requested a password reset. Use this link to reset your password: ${resetLink}\nIf you didn't request it, ignore.`,
    html: `<p>You requested a password reset. Click the link below to reset your password (expires in 1 hour):</p>
           <p><a href="${resetLink}">${resetLink}</a></p>
           <p>If you didn't request this, ignore this email.</p>`
  };
  return transporter.sendMail(mailOptions);
}

module.exports = { sendPasswordResetEmail };

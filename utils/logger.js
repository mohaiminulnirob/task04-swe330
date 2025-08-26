const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'profile-task-manager' },
  transports: [
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(__dirname, '..', 'logs', 'combined.log') })
  ]
});

// If in dev, also log to console as simple text
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(format.colorize(), format.simple())
  }));
}

module.exports = logger;

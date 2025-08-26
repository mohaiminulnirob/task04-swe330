require('dotenv').config();
const express = require('express');
const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());

// simple request logger
app.use((req, res, next) => {
  logger.info('%s %s', req.method, req.url);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// global error handler (must be after routes)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info('Server started on port %d', PORT);
  console.log(`Server listening on port ${PORT}`);
});

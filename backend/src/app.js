const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const logger = require('./config/logger');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const { apiLimiter } = require('./middlewares/rateLimiter');
const swaggerSpec = require('./swagger/swagger.json');

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(
  morgan('dev', {
    stream: { write: (msg) => logger.info(msg.trim()) }
  })
);

app.use('/api', apiLimiter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date() });
});

app.use(errorHandler);

module.exports = app;

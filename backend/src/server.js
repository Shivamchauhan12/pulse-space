const http = require('http');
const app = require('./app');
const config = require('./config');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSocket } = require('./services/socket.service');

const server = http.createServer(app);

initSocket(server, config.corsOrigin);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
      logger.info(`API docs available at http://localhost:${config.port}/api-docs`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
};

startServer();

module.exports = server;

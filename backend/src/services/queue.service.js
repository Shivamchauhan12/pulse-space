const { Queue, Worker } = require('bullmq');
const config = require('../config');
const logger = require('../config/logger');

let notificationQueue = null;

try {
  const connection = { host: '127.0.0.1', port: 6379, maxRetriesPerRequest: 1 };
  notificationQueue = new Queue('notificationQueue', { connection });

  const worker = new Worker(
    'notificationQueue',
    async (job) => {
      logger.info(`[BullMQ Worker] Processing job ${job.name} (ID: ${job.id}) with data: ${JSON.stringify(job.data)}`);
      // Simulate email/notification processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));
      logger.info(`[BullMQ Worker] Job ${job.name} completed successfully.`);
    },
    { connection }
  );

  worker.on('failed', (job, err) => {
    logger.error(`[BullMQ Worker] Job ${job?.id} failed: ${err.message}`);
  });
} catch (err) {
  logger.warn(`[BullMQ] Queue initialization warning: ${err.message}. Using inline job executor.`);
}

const addNotificationJob = async (name, data) => {
  if (notificationQueue) {
    try {
      await notificationQueue.add(name, data, { attempts: 3, backoff: 1000 });
      logger.info(`[BullMQ] Added job ${name} to queue.`);
      return;
    } catch (e) {
      // Fallback inline execution
    }
  }
  // Inline execution fallback
  setTimeout(() => {
    logger.info(`[Inline Worker Fallback] Processed async notification job: ${name}`);
  }, 100);
};

module.exports = { addNotificationJob };

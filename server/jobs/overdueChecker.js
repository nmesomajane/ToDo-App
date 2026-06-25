
import cron from 'node-cron';
import Task from '../models/task.js';
import User from '../models/user.js';
import { sendToUser } from '../utils/websocket.js';
import { sendOverdueEmail } from '../utils/mailer.js';
import logger from '../utils/logger.js';

export function startOverdueChecker() {

  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const overdueTasks = await Task.find({
        status: 'pending',
        dueDate: { $lt: now },
      }).populate('user', 'email name');

      if (overdueTasks.length === 0) return;

      logger.info(`Overdue checker: found ${overdueTasks.length} task(s) to process`);

      for (const task of overdueTasks) {
  // Use updateOne instead of task.save() — avoids validation on old docs
  await Task.updateOne(
    { _id: task._id },
    { $set: { status: 'overdue' } }
  );

  const userId = task.user?._id?.toString() || task.userId?.toString();
  const userEmail = task.user?.email || task.userId?.email;

  console.log('Overdue task:', task.title, '| userId:', userId, '| email:', userEmail);

  if (!userId) continue;

  sendToUser(userId, {
    type: 'TASK_OVERDUE',
    taskId: task._id,
    title: task.title,
    message: `Your task "${task.title}" is now overdue.`,
  });

  if (userEmail) {
    sendOverdueEmail(userEmail, task.title, task.dueDate)
      .then(() => console.log('Overdue email sent to:', userEmail))
      .catch((err) => logger.error('Overdue email error:', err.message));
  }
      }
    } catch (err) {
      logger.error('Overdue checker error:', err.message);
    }
  });

  logger.info('Overdue checker cron started (runs every minute)');
}
import Task from "../models/task.js";
import logger from "../utils/logger.js";
import User from '../models/user.js'
import { sendOverdueEmail, sendCompletedEmail } from '../utils/mailer.js';

export const getTasks = async (req, res, next) => {
  try {
    const { status, sort } = req.query;

   
    const filter = { user: req.user._id };

    if (status && ["pending", "completed"].includes(status)) {
      filter.status = status;
    } else {
      // Default: exclude deleted tasks
      filter.status = { $ne: "deleted" };
    }

    // Sort: newest first by default, oldest if ?sort=oldest
    const sortOrder = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const tasks = await Task.find(filter).sort(sortOrder);

    logger.info(`User ${req.user._id} fetched ${tasks.length} tasks`);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    logger.error(`getTasks error: ${error.message}`);
    next(error);
  }
};


export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(200).json({ success: true, task });
  } catch (error) {
    logger.error(`getTaskById error: ${error.message}`);
    next(error);
  }
};


export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
 
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    if (!dueDate) {
      return res.status(400).json({ message: 'Due date is required' });
    }
 
    const due = new Date(dueDate);
    if (isNaN(due.getTime())) {
      return res.status(400).json({ message: 'Invalid due date' });
    }
 
    // Determine initial status immediately — no need to wait for the cron.
    const status = due < new Date() ? 'overdue' : 'pending';
 
    const task = await Task.create({
      title: title.trim(),
      description: description?.trim() || '',
      dueDate: due,
      status,
      user: req.user._id,
    });
 
    logger.info(`Task created: ${task._id} by user ${req.user._id}`);
    res.status(201).json({ task });
  } catch (err) {
    logger.error('createTask error:', err);
    res.status(500).json({ message: 'Failed to create task' });
  }
};



export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const { title, description, dueDate, completed } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);

    const wasCompleted = task.completed;
    if (completed !== undefined) task.completed = completed;

    if (task.completed) {
      task.status = 'completed';
    } else if (task.dueDate && new Date(task.dueDate) < new Date()) {
      task.status = 'overdue';
    } else {
      task.status = 'pending';
    }

    await task.save();

    // Send response FIRST before doing async notifications
    res.json({ task });
        // THEN fire notifications after response is sent
   if (!wasCompleted && task.completed) {
  try {
    const user = await User.findById(req.user._id).select('email');
    console.log('User email:', user?.email);

    if (user?.email) {
      sendToUser(String(user._id), {
        type: 'TASK_COMPLETED',
        taskId: task._id,
        title: task.title,
        message: `"${task.title}" marked as complete. Nice work!`,
      });

      await sendCompletedEmail(user.email, task.title);
      console.log('Completion email sent to:', user.email);
    }
  } catch (notifErr) {
    logger.error('Notification error:', notifErr.message); // won't send another response
  }
}
  } catch (err) {
    logger.error('updateTask error:', err);
    res.status(500).json({ message: 'Failed to update task' });
  }
};


export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: "deleted" },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    logger.info(`User ${req.user._id} deleted task ${task._id}`);

    res.status(200).json({ success: true, message: "Task deleted", task });
  } catch (error) {
    logger.error(`deleteTask error: ${error.message}`);
    next(error);
  }
};


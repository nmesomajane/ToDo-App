import Task from "../models/task.js";
import logger from "../utils/logger.js";

export const getTasks = async (req, res, next) => {
  try {
    const { status, sort } = req.query;

    // Build filter — always scope to the logged-in user
    const filter = { userId: req.user._id };

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


export const createTask = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    const task = await Task.create({
      title,
      description,
      userId: req.user._id,
      status: "pending",
    });

    logger.info(`User ${req.user._id} created task ${task._id}`);

    res.status(201).json({ success: true, task });
  } catch (error) {
    logger.error(`createTask error: ${error.message}`);
    next(error);
  }
};


export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status } = req.body;

    // Only allow these fields to be updated
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true } // return updated doc + run schema validation
    );

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    logger.info(`User ${req.user._id} updated task ${task._id} → status: ${task.status}`);

    res.status(200).json({ success: true, task });
  } catch (error) {
    logger.error(`updateTask error: ${error.message}`);
    next(error);
  }
};


export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
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


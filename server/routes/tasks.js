import express from "express";
import { body, param, query, validationResult } from "express-validator";
import { getTasks, getTaskById, createTask, updateTask, deleteTask } from "../controllers/task.js";

import authorised from "../midleware/auth.js";
const   router = express.Router();


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};


const createTaskRules = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
];

const updateTaskRules = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty().withMessage("Title cannot be empty")
    .isLength({ max: 200 }).withMessage("Title cannot exceed 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage("Description cannot exceed 1000 characters"),
  body("status")
    .optional()
    .isIn(["pending", "completed", "deleted"]).withMessage("Status must be pending, completed, or deleted"),
];

const mongoIdRule = [
  param("id").isMongoId().withMessage("Invalid task ID"),
];

const queryRules = [
  query("status")
    .optional()
    .isIn(["pending", "completed"]).withMessage("Status filter must be pending or completed"),
  query("sort")
    .optional()
    .isIn(["newest", "oldest"]).withMessage("Sort must be newest or oldest"),
];



router.get("/",    authorised, queryRules,      validate, getTasks);
router.post("/",   authorised, createTaskRules, validate, createTask);
router.get("/:id", authorised, mongoIdRule,     validate, getTaskById);
router.patch("/:id", authorised, updateTaskRules, validate, updateTask);
router.delete("/:id", authorised, mongoIdRule,  validate, deleteTask);

export default router;
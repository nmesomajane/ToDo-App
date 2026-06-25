import  mongoose from 'mongoose';


const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    dueDate: {
      type: Date,
      default: null,
      required: true,
    },
   overdue: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "deleted", "overdue"],
        message: "Status must be pending, completed, or deleted",
      },
      default: "pending",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"],
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Index so queries by userId are fast
taskSchema.index({ userId: 1, status: 1 });

export default mongoose.model("Task", taskSchema);
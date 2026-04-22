import request from "supertest";
import mongoose from "mongoose";
import app from "../index.js";
import Task from "../models/task.js";
import User from "../models/user.js";


let token;       
let userId;     
let taskId;      

beforeAll(async () => {
  // Connect to a separate test DB so real data is never touched
  const testDbUri =
    process.env.MONGO_URI_TEST ||
    process.env.MONGO_URI.replace(/\/(\w+)(\?|$)/, "/tododb_test$2");

  await mongoose.connect(testDbUri);

  // Create a test user and get a token
  await User.deleteMany({});
  await Task.deleteMany({});

  const res = await request(app).post("/api/auth/signup").send({
    username: "testuser",
    password: "Password123!",
  });

  token = res.body.token;
  userId = res.body.user._id;
});

afterAll(async () => {
  await User.deleteMany({});
  await Task.deleteMany({});
  await mongoose.connection.close();
});

// ─────────────────────────────────────────────
// CREATE TASK
// ─────────────────────────────────────────────
describe("POST /api/tasks", () => {
  it("should create a task for authenticated user", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Buy groceries", description: "Milk, eggs, bread" });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.task.title).toBe("Buy groceries");
    expect(res.body.task.status).toBe("pending");
    expect(res.body.task.userId).toBe(userId);

    taskId = res.body.task._id; // save for later tests
  });

  it("should return 401 if no token is provided", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "No auth task" });

    expect(res.statusCode).toBe(401);
  });

  it("should return 400 if title is missing", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title here" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toMatch(/Title is required/i);
  });

  it("should return 400 if title exceeds 200 characters", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "a".repeat(201) });

    expect(res.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────
// GET ALL TASKS
// ─────────────────────────────────────────────
describe("GET /api/tasks", () => {
  it("should return all non-deleted tasks for the user", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.tasks)).toBe(true);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    // should not include deleted tasks
    res.body.tasks.forEach((t) => expect(t.status).not.toBe("deleted"));
  });

  it("should filter tasks by status=pending", async () => {
    const res = await request(app)
      .get("/api/tasks?status=pending")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    res.body.tasks.forEach((t) => expect(t.status).toBe("pending"));
  });

  it("should return 400 for invalid status filter", async () => {
    const res = await request(app)
      .get("/api/tasks?status=unknown")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });

  it("should return 401 for unauthenticated request", async () => {
    const res = await request(app).get("/api/tasks");
    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────
// GET SINGLE TASK
// ─────────────────────────────────────────────
describe("GET /api/tasks/:id", () => {
  it("should return a single task by ID", async () => {
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.task._id).toBe(taskId);
  });

  it("should return 404 for a non-existent task ID", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .get(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });

  it("should return 400 for an invalid MongoDB ID", async () => {
    const res = await request(app)
      .get("/api/tasks/not-a-valid-id")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
  });
});

// ─────────────────────────────────────────────
// UPDATE TASK
// ─────────────────────────────────────────────
describe("PATCH /api/tasks/:id", () => {
  it("should mark a task as completed", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "completed" });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.status).toBe("completed");
  });

  it("should update the title", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated title" });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe("Updated title");
  });

  it("should return 400 for invalid status value", async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "in-progress" }); // not allowed

    expect(res.statusCode).toBe(400);
  });

  it("should not allow updating another user's task", async () => {
    // Create a second user
    const res2 = await request(app).post("/api/auth/signup").send({
      username: "otheruser",
      password: "Password123!",
    });
    const otherToken = res2.body.token;

    const res = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${otherToken}`)
      .send({ title: "Hacked" });

    expect(res.statusCode).toBe(404); // task not found for this user
  });
});

// ─────────────────────────────────────────────
// DELETE TASK (soft delete)
// ─────────────────────────────────────────────
describe("DELETE /api/tasks/:id", () => {
  it("should soft-delete a task (set status to deleted)", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.task.status).toBe("deleted");
  });

  it("should not appear in the normal task listing after deletion", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    const found = res.body.tasks.find((t) => t._id === taskId);
    expect(found).toBeUndefined();
  });

  it("should return 404 when deleting a task that doesn't exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .delete(`/api/tasks/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
  });
});
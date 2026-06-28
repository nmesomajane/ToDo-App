import express from "express";
import http  from 'http';
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";

import dotenv from 'dotenv'
import authRouter from './routes/auth.js';
import taskRouter from './routes/tasks.js';
import { initWebSocketServer } from './WebsocketServer.js';
import { startOverdueChecker } from './jobs/overdueChecker.js';
import logger from './utils/logger.js';


dotenv.config()
const app = express();


app.use(bodyParser.json({ limit: "30mb", extended: true }));

app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors({
  origin: [ 'http://localhost:5173', 'https://todo-app-4d5k.onrender.com' ,],
  credentials: true
}));

app.use('/api/auth', authRouter);
app.use('/api/tasks', taskRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));




const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;


mongoose.connect(CONNECTION_URL)
  .then(() => {
    logger.info("✅ Successfully connected to MongoDB Atlas!");
    const server = http.createServer(app);
   server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
    initWebSocketServer(server);
  startOverdueChecker();
});
  })
  .catch((err) => {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });

//mongodb+srv://admin:

import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";

const { combine, timestamp, printf, colorize, errors } = format;


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "HH:mm:ss" }),
        logFormat
      ),
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/app.log"),
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
  ],
});

export default logger;
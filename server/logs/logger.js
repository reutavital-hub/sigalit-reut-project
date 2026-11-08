const winston = require("winston");
const path = require("path");
const fs = require("fs");
const DailyRotateFile = require("winston-daily-rotate-file");

// יצירת תיקיית הלוגים אם היא אינה קיימת
fs.mkdirSync(__dirname, { recursive: true });

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),

  transports: [
    // לוג כללי: info, warn ו-error
    new DailyRotateFile({
      filename: path.join(__dirname, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: true,
    }),

    // לוג שגיאות בלבד
    new DailyRotateFile({
      filename: path.join(__dirname, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: "10m",
      maxFiles: "14d",
      zippedArchive: true,
    }),
  ],
});

// הצגת לוגים גם בטרמינל בזמן פיתוח
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
}

module.exports = logger;

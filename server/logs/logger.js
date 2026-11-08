
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// יצירת תיקיית הלוגים אם היא אינה קיימת
fs.mkdirSync(__dirname, { recursive: true });

const logger = winston.createLogger({
    level: 'info',

    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),

    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, 'combined.log')
        }),

        new winston.transports.File({
            filename: path.join(__dirname, 'error.log'),
            level: 'error'
        })
    ]
});

// הצגת לוגים גם בטרמינל בזמן פיתוח
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;

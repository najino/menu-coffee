import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const infoFileLogger = new winston.transports.File({
  filename: `${process.cwd()}/logs/combine.log`,
  level: 'info',
});
const consoleLogger = new winston.transports.Console();

const transports: winston.transport[] = [];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: `${process.cwd()}/logs/error.log`,
      level: 'error',
    }),
    infoFileLogger,
  );
} else {
  transports.push(consoleLogger);
}

const logger = WinstonModule.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, context }) => {
      return `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''}: ${message}`;
    }),
    winston.format.colorize({ all: true }),
  ),

  transports,
});

export default logger;

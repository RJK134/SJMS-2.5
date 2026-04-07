import winston from "winston";

const { combine, timestamp, json, printf, colorize } = winston.format;

const devFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level}]: ${message}${metaStr}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  defaultMeta: { service: "sjms-api", version: "2.5.0" },
  transports: [
    new winston.transports.Console({
      format:
        process.env.NODE_ENV === "production"
          ? combine(timestamp(), json())
          : combine(timestamp({ format: "HH:mm:ss" }), colorize(), devFormat),
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
  logger.add(
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    })
  );
}

export default logger;

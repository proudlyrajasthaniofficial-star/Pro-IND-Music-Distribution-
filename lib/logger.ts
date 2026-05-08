import winston from 'winston';

const { combine, timestamp, json, colorize, printf } = winston.format;

// Custom format for console logging (readable)
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  if (Object.keys(metadata).length > 0) {
    // Mask sensitive fields
    const maskedMetadata = { ...metadata };
    const sensitiveFields = ['password', 'token', 'otp', 'apiKey', 'secret', 'cvv', 'card_number'];
    
    sensitiveFields.forEach(field => {
      if (maskedMetadata[field]) maskedMetadata[field] = '********';
    });

    msg += ` ${JSON.stringify(maskedMetadata)}`;
  }
  return msg;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
      ),
    }),
  ],
});

export default logger;

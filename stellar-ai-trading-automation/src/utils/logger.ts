// Stellar AI Trading Automation - Logging Utility
// Structured logging with Winston for better observability

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { config } from '../config';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss.SSS'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create transports
const transports: winston.transport[] = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: config.logging.level,
    format: consoleFormat,
    silent: config.nodeEnv === 'test'
  })
);

// File transports (only in production or when LOG_FILE_PATH is set)
if (config.nodeEnv === 'production' || config.logging.filePath) {
  // Error log file
  transports.push(
    new DailyRotateFile({
      filename: `${config.logging.filePath}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: logFormat,
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      zippedArchive: true
    })
  );

  // Combined log file
  transports.push(
    new DailyRotateFile({
      filename: `${config.logging.filePath}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      format: logFormat,
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      zippedArchive: true
    })
  );

  // Application log file
  transports.push(
    new DailyRotateFile({
      filename: `${config.logging.filePath}/app-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: logFormat,
      maxSize: config.logging.maxSize,
      maxFiles: config.logging.maxFiles,
      zippedArchive: true
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: {
    service: 'stellar-ai-trading',
    version: process.env.npm_package_version || '2.0.0',
    environment: config.nodeEnv
  },
  transports,
  exitOnError: false
});

// Add request ID to logs
export const addRequestId = (requestId: string) => {
  return logger.child({ requestId });
};

// Trading specific logger
export const tradingLogger = logger.child({ module: 'trading' });

// AI specific logger
export const aiLogger = logger.child({ module: 'ai' });

// Strategy specific logger
export const strategyLogger = logger.child({ module: 'strategy' });

// Market data specific logger
export const marketDataLogger = logger.child({ module: 'market-data' });

// Blockchain specific logger
export const blockchainLogger = logger.child({ module: 'blockchain' });

// API specific logger
export const apiLogger = logger.child({ module: 'api' });

// Database specific logger
export const dbLogger = logger.child({ module: 'database' });

// Security specific logger
export const securityLogger = logger.child({ module: 'security' });

// Performance specific logger
export const performanceLogger = logger.child({ module: 'performance' });

// Custom log levels for trading events
export const logTradingEvent = (event: string, data: any) => {
  tradingLogger.info('Trading Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for AI events
export const logAIEvent = (event: string, data: any) => {
  aiLogger.info('AI Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for strategy events
export const logStrategyEvent = (event: string, data: any) => {
  strategyLogger.info('Strategy Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for market data events
export const logMarketDataEvent = (event: string, data: any) => {
  marketDataLogger.info('Market Data Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for blockchain events
export const logBlockchainEvent = (event: string, data: any) => {
  blockchainLogger.info('Blockchain Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for API events
export const logAPIEvent = (event: string, data: any) => {
  apiLogger.info('API Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for database events
export const logDatabaseEvent = (event: string, data: any) => {
  dbLogger.info('Database Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for security events
export const logSecurityEvent = (event: string, data: any) => {
  securityLogger.warn('Security Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Custom log levels for performance events
export const logPerformanceEvent = (event: string, data: any) => {
  performanceLogger.info('Performance Event', {
    event,
    data,
    timestamp: new Date().toISOString()
  });
};

// Error logging with context
export const logError = (error: Error, context?: any) => {
  logger.error('Application Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context,
    timestamp: new Date().toISOString()
  });
};

// Warning logging with context
export const logWarning = (message: string, context?: any) => {
  logger.warn('Application Warning', {
    message,
    context,
    timestamp: new Date().toISOString()
  });
};

// Info logging with context
export const logInfo = (message: string, context?: any) => {
  logger.info('Application Info', {
    message,
    context,
    timestamp: new Date().toISOString()
  });
};

// Debug logging with context
export const logDebug = (message: string, context?: any) => {
  logger.debug('Application Debug', {
    message,
    context,
    timestamp: new Date().toISOString()
  });
};

// Performance logging
export const logPerformance = (operation: string, duration: number, context?: any) => {
  performanceLogger.info('Performance Metric', {
    operation,
    duration,
    context,
    timestamp: new Date().toISOString()
  });
};

// Memory usage logging
export const logMemoryUsage = () => {
  const usage = process.memoryUsage();
  performanceLogger.info('Memory Usage', {
    rss: Math.round(usage.rss / 1024 / 1024) + ' MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
    external: Math.round(usage.external / 1024 / 1024) + ' MB',
    timestamp: new Date().toISOString()
  });
};

// CPU usage logging
export const logCPUUsage = () => {
  const usage = process.cpuUsage();
  performanceLogger.info('CPU Usage', {
    user: usage.user,
    system: usage.system,
    timestamp: new Date().toISOString()
  });
};

// Request logging middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  const requestId = req.id || Math.random().toString(36).substr(2, 9);
  
  req.logger = addRequestId(requestId);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId
    };
    
    if (res.statusCode >= 400) {
      req.logger.warn('HTTP Request', logData);
    } else {
      req.logger.info('HTTP Request', logData);
    }
  });
  
  next();
};

// Export default logger
export default logger;

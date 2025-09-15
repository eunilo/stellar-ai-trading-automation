// Stellar AI Trading Automation - Main Application Entry Point
// Orchestrates all services and starts the server

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from './config';
import { logger } from './utils/logger';
import { StellarService } from './services/StellarService';
import { SoroswapService } from './services/SoroswapService';
import { AIService } from './services/AIService';
import { MarketDataService } from './services/MarketDataService';
import { StrategyManager } from './services/StrategyManager';

// Import API routes
import aiRoutes from './api/routes/ai';
import soroswapRoutes from './api/routes/soroswap';
import strategiesRoutes from './api/routes/strategies';
import marketDataRoutes from './api/routes/marketData';

class StellarAITradingApp {
  private app: express.Application;
  private server: any;
  private io: SocketIOServer;
  private stellarService: StellarService;
  private soroswapService: SoroswapService;
  private aiService: AIService;
  private marketDataService: MarketDataService;
  private strategyManager: StrategyManager;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: config.cors.origin,
        methods: config.cors.methods,
        credentials: config.cors.credentials
      }
    });

    // Initialize services
    this.stellarService = new StellarService();
    this.soroswapService = new SoroswapService();
    this.aiService = new AIService();
    this.marketDataService = new MarketDataService();
    this.strategyManager = new StrategyManager(
      this.stellarService,
      this.soroswapService,
      this.aiService,
      this.marketDataService
    );

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      crossOriginEmbedderPolicy: false
    }));

    // CORS
    this.app.use(cors({
      origin: config.cors.origin,
      methods: config.cors.methods,
      allowedHeaders: config.cors.headers,
      credentials: config.cors.credentials
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.maxRequests,
      message: {
        success: false,
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        timestamp: new Date()
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: config.rateLimit.skipSuccessfulRequests
    });
    this.app.use('/api', limiter);

    // Compression
    this.app.use(compression());

    // Logging
    this.app.use(morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim())
      }
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request ID
    this.app.use((req, res, next) => {
      req.id = Math.random().toString(36).substr(2, 9);
      res.setHeader('X-Request-ID', req.id);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        success: true,
        data: {
          status: 'healthy',
          timestamp: new Date(),
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: process.env.npm_package_version || '1.0.0'
        },
        timestamp: new Date()
      });
    });

    // Metrics endpoint
    this.app.get('/metrics', (req, res) => {
      res.json({
        success: true,
        data: {
          requests: {
            total: 0, // TODO: Implement metrics collection
            successful: 0,
            failed: 0,
            averageResponseTime: 0
          },
          trading: {
            totalTrades: 0,
            successfulTrades: 0,
            failedTrades: 0,
            totalVolume: 0,
            totalFees: 0
          },
          ai: {
            predictions: 0,
            accuracy: 0,
            averageConfidence: 0
          },
          system: {
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal,
            cpuUsage: process.cpuUsage()
          }
        },
        timestamp: new Date()
      });
    });

    // API routes
    this.app.use('/api/ai', aiRoutes);
    this.app.use('/api/soroswap', soroswapRoutes);
    this.app.use('/api/strategies', strategiesRoutes);
    this.app.use('/api/market', marketDataRoutes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        data: {
          name: 'Stellar AI Trading Automation',
          version: '2.0.0',
          description: 'AI-Powered Trading and Yield Optimization on Stellar Ecosystem',
          endpoints: {
            health: '/health',
            metrics: '/metrics',
            api: '/api',
            docs: '/api-docs'
          }
        },
        timestamp: new Date()
      });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date()
      });
    });
  }

  private setupWebSocket(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Join room for real-time updates
      socket.on('join', (room: string) => {
        socket.join(room);
        logger.info(`Client ${socket.id} joined room: ${room}`);
      });

      // Leave room
      socket.on('leave', (room: string) => {
        socket.leave(room);
        logger.info(`Client ${socket.id} left room: ${room}`);
      });

      // Handle trading signals
      socket.on('subscribe_trading_signals', (pair: string) => {
        socket.join(`trading_signals_${pair}`);
        logger.info(`Client ${socket.id} subscribed to trading signals for ${pair}`);
      });

      // Handle strategy updates
      socket.on('subscribe_strategy', (strategyId: string) => {
        socket.join(`strategy_${strategyId}`);
        logger.info(`Client ${socket.id} subscribed to strategy ${strategyId}`);
      });

      // Handle market data
      socket.on('subscribe_market_data', (pair: string) => {
        socket.join(`market_data_${pair}`);
        logger.info(`Client ${socket.id} subscribed to market data for ${pair}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });

    // Broadcast trading signals
    this.strategyManager.on('trading_signal', (signal) => {
      this.io.to(`trading_signals_${signal.pair}`).emit('trading_signal', signal);
    });

    // Broadcast strategy updates
    this.strategyManager.on('strategy_update', (strategy) => {
      this.io.to(`strategy_${strategy.id}`).emit('strategy_update', strategy);
    });

    // Broadcast market data
    this.marketDataService.on('market_data', (data) => {
      this.io.to(`market_data_${data.symbol}`).emit('market_data', data);
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error('Unhandled error:', err);

      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';

      res.status(statusCode).json({
        success: false,
        error: message,
        message: 'An error occurred while processing your request',
        code: err.code || 'INTERNAL_ERROR',
        timestamp: new Date(),
        ...(config.nodeEnv === 'development' && { stack: err.stack })
      });
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      process.exit(1);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      process.exit(1);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    // Handle SIGINT
    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  public async start(): Promise<void> {
    try {
      // Initialize services
      await this.stellarService.initialize();
      await this.soroswapService.initialize();
      await this.aiService.initialize();
      await this.marketDataService.initialize();
      await this.strategyManager.initialize();

      // Start server
      this.server.listen(config.port, config.host, () => {
        logger.info(`🚀 Stellar AI Trading Automation started on ${config.host}:${config.port}`);
        logger.info(`📊 Environment: ${config.nodeEnv}`);
        logger.info(`🔗 API Documentation: http://${config.host}:${config.port}/api-docs`);
        logger.info(`💚 Health Check: http://${config.host}:${config.port}/health`);
        logger.info(`📈 Metrics: http://${config.host}:${config.port}/metrics`);
      });

      // Start background services
      this.startBackgroundServices();

    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  private startBackgroundServices(): void {
    // Start AI prediction service
    setInterval(async () => {
      try {
        await this.aiService.makePredictions();
      } catch (error) {
        logger.error('AI prediction service error:', error);
      }
    }, config.ai.predictionInterval);

    // Start market data updates
    setInterval(async () => {
      try {
        await this.marketDataService.updateMarketData();
      } catch (error) {
        logger.error('Market data update error:', error);
      }
    }, 30000); // Every 30 seconds

    // Start strategy monitoring
    setInterval(async () => {
      try {
        await this.strategyManager.monitorStrategies();
      } catch (error) {
        logger.error('Strategy monitoring error:', error);
      }
    }, 60000); // Every minute

    logger.info('Background services started');
  }

  public async shutdown(): Promise<void> {
    logger.info('Shutting down application...');

    try {
      // Stop accepting new connections
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close WebSocket connections
      this.io.close(() => {
        logger.info('WebSocket server closed');
      });

      // Stop services
      await this.strategyManager.stop();
      await this.marketDataService.stop();
      await this.aiService.stop();
      await this.soroswapService.stop();
      await this.stellarService.stop();

      logger.info('Application shutdown complete');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and start the application
const app = new StellarAITradingApp();

// Start the application
app.start().catch((error) => {
  logger.error('Failed to start application:', error);
  process.exit(1);
});

export default app;

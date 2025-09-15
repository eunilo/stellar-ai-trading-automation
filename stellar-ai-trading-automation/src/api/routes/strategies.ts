// Stellar AI Trading Automation - Strategies Routes
// API endpoints for trading strategy management

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { logger } from '../../utils/logger';
import { StrategyManager } from '../../services/StrategyManager';
import { StellarService } from '../../services/StellarService';
import { SoroswapService } from '../../services/SoroswapService';
import { AIService } from '../../services/AIService';
import { MarketDataService } from '../../services/MarketDataService';
import { APIResponse, Strategy, StrategyType, StrategyStatus } from '../../types';

const router = Router();

// Initialize services (in real app, these would be injected)
const stellarService = new StellarService();
const soroswapService = new SoroswapService();
const aiService = new AIService();
const marketDataService = new MarketDataService();
const strategyManager = new StrategyManager(stellarService, soroswapService, aiService, marketDataService);

// Initialize services
Promise.all([
  stellarService.initialize(),
  soroswapService.initialize(),
  aiService.initialize(),
  marketDataService.initialize(),
  strategyManager.initialize()
]).catch(error => {
  logger.error('Failed to initialize services:', error);
});

// GET /api/strategies - Get all strategies
router.get('/', async (_req: Request, res: Response) => {
  try {
    const strategies = await strategyManager.getStrategies();
    
    const response: APIResponse<Strategy[]> = {
      success: true,
      data: strategies,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get strategies:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get strategies',
      message: 'An error occurred while fetching strategies',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/strategies/:id - Get specific strategy
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('Strategy ID is required')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { id } = req.params;
    const strategy = await strategyManager.getStrategy(id);
    
    if (!strategy) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Strategy not found',
        message: `Strategy with ID ${id} not found`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }
    
    const response: APIResponse<Strategy> = {
      success: true,
      data: strategy,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get strategy:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get strategy',
      message: 'An error occurred while fetching strategy',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/strategies - Create new strategy
router.post('/', [
  body('name').isString().notEmpty().withMessage('Name is required'),
  body('type').isIn(['GRID', 'DCA', 'MOMENTUM', 'ARBITRAGE']).withMessage('Type must be GRID, DCA, MOMENTUM, or ARBITRAGE'),
  body('config').isObject().withMessage('Config is required'),
  body('config.pair').isString().notEmpty().withMessage('Pair is required'),
  body('config.amount').isNumeric().withMessage('Amount must be a number')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { name, type, config } = req.body;
    
    const strategyData = {
      name,
      type: type as StrategyType,
      status: StrategyStatus.ACTIVE,
      config
    };

    const strategy = await strategyManager.createStrategy(strategyData);
    
    const response: APIResponse<Strategy> = {
      success: true,
      data: strategy,
      message: 'Strategy created successfully',
      timestamp: new Date()
    };
    
    res.status(201).json(response);
  } catch (error) {
    logger.error('Failed to create strategy:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to create strategy',
      message: 'An error occurred while creating strategy',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/strategies/:id/start - Start strategy
router.post('/:id/start', [
  param('id').isString().notEmpty().withMessage('Strategy ID is required')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { id } = req.params;
    await strategyManager.startStrategy(id);
    
    const response: APIResponse<null> = {
      success: true,
      message: `Strategy ${id} started successfully`,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to start strategy:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to start strategy',
      message: error instanceof Error ? error.message : 'An error occurred while starting strategy',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/strategies/:id/stop - Stop strategy
router.post('/:id/stop', [
  param('id').isString().notEmpty().withMessage('Strategy ID is required')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { id } = req.params;
    await strategyManager.stopStrategy(id);
    
    const response: APIResponse<null> = {
      success: true,
      message: `Strategy ${id} stopped successfully`,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to stop strategy:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to stop strategy',
      message: error instanceof Error ? error.message : 'An error occurred while stopping strategy',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/strategies/:id/pause - Pause strategy
router.post('/:id/pause', [
  param('id').isString().notEmpty().withMessage('Strategy ID is required')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { id } = req.params;
    await strategyManager.pauseStrategy(id);
    
    const response: APIResponse<null> = {
      success: true,
      message: `Strategy ${id} paused successfully`,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to pause strategy:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to pause strategy',
      message: error instanceof Error ? error.message : 'An error occurred while pausing strategy',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/strategies/:id/performance - Get strategy performance
router.get('/:id/performance', [
  param('id').isString().notEmpty().withMessage('Strategy ID is required')
], async (_req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Validation failed',
        message: errors.array()[0].msg,
        timestamp: new Date()
      };
      return res.status(400).json(response);
    }

    const { id } = req.params;
    const strategy = await strategyManager.getStrategy(id);
    
    if (!strategy) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Strategy not found',
        message: `Strategy with ID ${id} not found`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }
    
    const response: APIResponse<typeof strategy.performance> = {
      success: true,
      data: strategy.performance,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get strategy performance:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get strategy performance',
      message: 'An error occurred while fetching strategy performance',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/strategies/types - Get available strategy types
router.get('/types', async (_req: Request, res: Response) => {
  try {
    const types = [
      {
        type: 'GRID',
        name: 'Grid Trading',
        description: 'Trading based on grid levels for sideways markets',
        parameters: ['gridSize', 'gridSpacing', 'priceRange', 'rebalanceThreshold']
      },
      {
        type: 'DCA',
        name: 'Dollar Cost Averaging',
        description: 'Regular investments to reduce volatility impact',
        parameters: ['interval', 'amount', 'maxInvestments', 'priceThreshold']
      },
      {
        type: 'MOMENTUM',
        name: 'Momentum Trading',
        description: 'Follows market trends using technical indicators',
        parameters: ['lookbackPeriod', 'momentumThreshold', 'volumeThreshold', 'indicators']
      },
      {
        type: 'ARBITRAGE',
        name: 'Arbitrage Trading',
        description: 'Exploits price differences between exchanges',
        parameters: ['minSpread', 'maxSpread', 'executionDelay', 'maxSlippage']
      }
    ];
    
    const response: APIResponse<typeof types> = {
      success: true,
      data: types,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get strategy types:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get strategy types',
      message: 'An error occurred while fetching strategy types',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

export default router;

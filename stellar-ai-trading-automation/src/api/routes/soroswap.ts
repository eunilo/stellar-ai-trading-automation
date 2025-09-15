// Stellar AI Trading Automation - Soroswap Routes
// API endpoints for Soroswap DEX interactions

import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { logger } from '../../utils/logger';
import { SoroswapService } from '../../services/SoroswapService';
import { APIResponse, QuoteRequest, TradeRequest, PoolInfo } from '../../types';

const router = Router();

// Initialize Soroswap service (in real app, this would be injected)
const soroswapService = new SoroswapService();

// Initialize Soroswap service
soroswapService.initialize().catch(error => {
  logger.error('Failed to initialize Soroswap service:', error);
});

// GET /api/soroswap/pools - Get available pools
router.get('/pools', async (_req: Request, res: Response) => {
  try {
    const pools = await soroswapService.getPools();
    
    const response: APIResponse<PoolInfo[]> = {
      success: true,
      data: pools,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get pools:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get pools',
      message: 'An error occurred while fetching pools',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/soroswap/pools/:id - Get specific pool info
router.get('/pools/:id', async (_req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pool = await soroswapService.getPoolInfo(id);
    
    if (!pool) {
      const response: APIResponse<null> = {
        success: false,
        error: 'Pool not found',
        message: `Pool with ID ${id} not found`,
        timestamp: new Date()
      };
      return res.status(404).json(response);
    }
    
    const response: APIResponse<PoolInfo> = {
      success: true,
      data: pool,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get pool info:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get pool info',
      message: 'An error occurred while fetching pool info',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/soroswap/quote - Get trade quote
router.post('/quote', [
  body('pair').isString().notEmpty().withMessage('Pair is required'),
  body('side').isIn(['BUY', 'SELL']).withMessage('Side must be BUY or SELL'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('slippageTolerance').optional().isNumeric().withMessage('Slippage tolerance must be a number')
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

    const quoteRequest: QuoteRequest = {
      pair: req.body.pair,
      side: req.body.side,
      amount: parseFloat(req.body.amount),
      slippageTolerance: parseFloat(req.body.slippageTolerance || '0.5')
    };

    const quote = await soroswapService.getQuote(quoteRequest);
    
    const response: APIResponse<typeof quote> = {
      success: true,
      data: quote,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get quote:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get quote',
      message: 'An error occurred while getting quote',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// POST /api/soroswap/trade - Execute trade
router.post('/trade', [
  body('pair').isString().notEmpty().withMessage('Pair is required'),
  body('side').isIn(['BUY', 'SELL']).withMessage('Side must be BUY or SELL'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('slippageTolerance').optional().isNumeric().withMessage('Slippage tolerance must be a number'),
  body('deadline').optional().isNumeric().withMessage('Deadline must be a number'),
  body('recipient').isString().notEmpty().withMessage('Recipient is required')
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

    const tradeRequest: TradeRequest = {
      pair: req.body.pair,
      side: req.body.side,
      amount: parseFloat(req.body.amount),
      slippageTolerance: parseFloat(req.body.slippageTolerance || '0.5'),
      deadline: parseInt(req.body.deadline || (Date.now() + 300000).toString()),
      recipient: req.body.recipient
    };

    const trade = await soroswapService.executeTrade(tradeRequest);
    
    const response: APIResponse<typeof trade> = {
      success: true,
      data: trade,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to execute trade:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to execute trade',
      message: 'An error occurred while executing trade',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/soroswap/price/:pair - Get current price
router.get('/price/:pair', async (_req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const price = await soroswapService.getPrice(pair);
    
    const response: APIResponse<{ pair: string; price: number }> = {
      success: true,
      data: { pair, price },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get price:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get price',
      message: 'An error occurred while getting price',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/soroswap/volume/:pair - Get 24h volume
router.get('/volume/:pair', async (_req: Request, res: Response) => {
  try {
    const { pair } = req.params;
    const volume = await soroswapService.getVolume24h(pair);
    
    const response: APIResponse<{ pair: string; volume24h: number }> = {
      success: true,
      data: { pair, volume24h: volume },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get volume:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get volume',
      message: 'An error occurred while getting volume',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/soroswap/route - Get best route
router.get('/route', [
  query('pair').isString().notEmpty().withMessage('Pair is required'),
  query('amount').isNumeric().withMessage('Amount must be a number'),
  query('side').isIn(['BUY', 'SELL']).withMessage('Side must be BUY or SELL')
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

    const { pair, amount, side } = req.query;
    const route = await soroswapService.getBestRoute(
      pair as string,
      parseFloat(amount as string),
      side as 'BUY' | 'SELL'
    );
    
    const response: APIResponse<{ pair: string; route: string[] }> = {
      success: true,
      data: { pair: pair as string, route },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get route:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get route',
      message: 'An error occurred while getting route',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/soroswap/liquidity/:poolId - Get pool liquidity
router.get('/liquidity/:poolId', async (_req: Request, res: Response) => {
  try {
    const { poolId } = req.params;
    const liquidity = await soroswapService.getLiquidity(poolId);
    
    const response: APIResponse<typeof liquidity> = {
      success: true,
      data: liquidity,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get liquidity:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get liquidity',
      message: 'An error occurred while getting liquidity',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

export default router;

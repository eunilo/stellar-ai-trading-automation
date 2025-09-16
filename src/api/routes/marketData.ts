// Stellar AI Trading Automation - Market Data Routes
// API endpoints for market data and analysis

import { Router, Request, Response } from 'express';
import { query, param, validationResult } from 'express-validator';
import { logger } from '../../utils/logger';
import { MarketDataService } from '../../services/MarketDataService';
import { APIResponse, MarketData, PriceHistory } from '../../types';

const router = Router();

// Initialize Market Data service (in real app, this would be injected)
const marketDataService = new MarketDataService();

// Initialize Market Data service
marketDataService.initialize().catch(error => {
  logger.error('Failed to initialize Market Data service:', error);
});

// GET /api/market/prices - Get current prices
router.get('/prices', async (_req: Request, res: Response) => {
  try {
    const prices = await marketDataService.fetchMarketData();
    
    const response: APIResponse<MarketData[]> = {
      success: true,
      data: prices,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get prices:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get prices',
      message: 'An error occurred while fetching prices',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/price/:symbol - Get specific price
router.get('/price/:symbol', [
  param('symbol').isString().notEmpty().withMessage('Symbol is required')
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

    const { symbol } = req.params;
    const price = await marketDataService.getPrice(symbol);
    
    const response: APIResponse<{ symbol: string; price: number }> = {
      success: true,
      data: { symbol, price },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get price:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get price',
      message: error instanceof Error ? error.message : 'An error occurred while getting price',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/history/:symbol - Get price history
router.get('/history/:symbol', [
  param('symbol').isString().notEmpty().withMessage('Symbol is required'),
  query('interval').optional().isIn(['1m', '5m', '15m', '1h', '4h', '1d']).withMessage('Interval must be 1m, 5m, 15m, 1h, 4h, or 1d')
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

    const { symbol } = req.params;
    const { interval = '1h' } = req.query;
    
    const history = await marketDataService.getPriceHistory(symbol, interval as any);
    
    const response: APIResponse<PriceHistory> = {
      success: true,
      data: history,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get price history:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get price history',
      message: 'An error occurred while fetching price history',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/volume/:symbol - Get 24h volume
router.get('/volume/:symbol', [
  param('symbol').isString().notEmpty().withMessage('Symbol is required')
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

    const { symbol } = req.params;
    const volume = await marketDataService.getVolume24h(symbol);
    
    const response: APIResponse<{ symbol: string; volume24h: number }> = {
      success: true,
      data: { symbol, volume24h: volume },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get volume:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get volume',
      message: error instanceof Error ? error.message : 'An error occurred while getting volume',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/trends - Get market trends
router.get('/trends', async (_req: Request, res: Response) => {
  try {
    const trends = await marketDataService.getMarketTrends();
    
    const response: APIResponse<typeof trends> = {
      success: true,
      data: trends,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get market trends:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get market trends',
      message: 'An error occurred while fetching market trends',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/gainers - Get top gainers
router.get('/gainers', async (_req: Request, res: Response) => {
  try {
    const gainers = await marketDataService.getTopGainers();
    
    const response: APIResponse<MarketData[]> = {
      success: true,
      data: gainers,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get top gainers:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get top gainers',
      message: 'An error occurred while fetching top gainers',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/losers - Get top losers
router.get('/losers', async (_req: Request, res: Response) => {
  try {
    const losers = await marketDataService.getTopLosers();
    
    const response: APIResponse<MarketData[]> = {
      success: true,
      data: losers,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get top losers:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get top losers',
      message: 'An error occurred while fetching top losers',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/marketcap/:symbol - Get market cap
router.get('/marketcap/:symbol', [
  param('symbol').isString().notEmpty().withMessage('Symbol is required')
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

    const { symbol } = req.params;
    const marketCap = await marketDataService.getMarketCap(symbol);
    
    const response: APIResponse<{ symbol: string; marketCap: number }> = {
      success: true,
      data: { symbol, marketCap },
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get market cap:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get market cap',
      message: error instanceof Error ? error.message : 'An error occurred while getting market cap',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

// GET /api/market/summary - Get market summary
router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const [prices, trends, gainers, losers] = await Promise.all([
      marketDataService.fetchMarketData(),
      marketDataService.getMarketTrends(),
      marketDataService.getTopGainers(),
      marketDataService.getTopLosers()
    ]);

    const summary = {
      totalPairs: prices.length,
      totalVolume24h: prices.reduce((sum, p) => sum + p.volume, 0),
      averageChange24h: prices.reduce((sum, p) => sum + p.changePercent24h, 0) / prices.length,
      trends: {
        up: trends.filter(t => t.trend === 'up').length,
        down: trends.filter(t => t.trend === 'down').length,
        sideways: trends.filter(t => t.trend === 'sideways').length
      },
      topGainers: gainers.slice(0, 5),
      topLosers: losers.slice(0, 5),
      lastUpdate: new Date()
    };
    
    const response: APIResponse<typeof summary> = {
      success: true,
      data: summary,
      timestamp: new Date()
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to get market summary:', error);
    
    const response: APIResponse<null> = {
      success: false,
      error: 'Failed to get market summary',
      message: 'An error occurred while fetching market summary',
      timestamp: new Date()
    };
    
    res.status(500).json(response);
  }
});

export default router;

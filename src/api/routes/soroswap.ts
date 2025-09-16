import { Router, Request, Response } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { logger } from '../../utils/logger';
import { SoroswapService } from '../../services/SoroswapService';
import { APIResponse } from '../../types';

const router = Router();
const soroswap = new SoroswapService();

// Inicialização opcional do serviço
soroswap.initialize().catch(error => {
  logger.warn('Soroswap service init failed (continuando em modo mock):', error);
});

// GET /api/soroswap/pools
router.get('/pools', async (_req: Request, res: Response) => {
  try {
    const pools = await soroswap.getPools();
    const response: APIResponse = { success: true, data: pools, timestamp: new Date() };
    res.json(response);
  } catch (error) {
    logger.error('Failed to list pools:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to list pools',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    res.status(500).json(response);
  }
});

// GET /api/soroswap/quote?pair=BASE/QUOTE&side=BUY|SELL&amount=1.23&slippageTolerance=0.005
router.get('/quote', [
  query('pair').isString().notEmpty(),
  query('side').isIn(['BUY', 'SELL']),
  query('amount').isFloat({ gt: 0 }),
  query('slippageTolerance').optional().isFloat({ min: 0, max: 1 })
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }

    const { pair, side } = req.query as any;
    const amount = parseFloat(String(req.query['amount']));
    const slippageTolerance = req.query['slippageTolerance'] !== undefined ? parseFloat(String(req.query['slippageTolerance'])) : 0.005;

    const quote = await soroswap.getQuote({ pair, side, amount, slippageTolerance });
    const response: APIResponse = { success: true, data: quote, timestamp: new Date() };
    return res.json(response);
  } catch (error) {
    logger.error('Failed to get quote:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to get quote',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// POST /api/soroswap/trade
router.post('/trade', [
  body('pair').isString().notEmpty(),
  body('side').isIn(['BUY', 'SELL']),
  body('amount').isFloat({ gt: 0 }),
  body('slippageTolerance').optional().isFloat({ min: 0, max: 1 }),
  body('deadline').optional().isInt({ gt: 0 }),
  body('recipient').isString().notEmpty()
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }

    const { pair, side, amount, recipient } = req.body;
    const slippageTolerance: number = req.body.slippageTolerance ?? 0.005;
    const deadline: number = req.body.deadline ?? Math.floor(Date.now() / 1000) + 60 * 5; // 5 minutos

    const result = await soroswap.executeTrade({ pair, side, amount: Number(amount), slippageTolerance, deadline, recipient });
    const response: APIResponse = { success: true, data: result, timestamp: new Date() };
    return res.json(response);
  } catch (error) {
    logger.error('Failed to execute trade:', error);
    const response: APIResponse = {
      success: false,
      error: 'Failed to execute trade',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date()
    };
    return res.status(500).json(response);
  }
});

// GET /api/soroswap/price/:pair
router.get('/price/:pair', [param('pair').isString().notEmpty()], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }
    const pair = req.params['pair'] as string;
    const price = await soroswap.getPrice(pair);
    return res.json({ success: true, data: { pair, price }, timestamp: new Date() });
  } catch (error) {
    logger.error('Failed to get price:', error);
    return res.status(500).json({ success: false, error: 'Failed to get price', message: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() });
  }
});

// GET /api/soroswap/volume/:pair
router.get('/volume/:pair', [param('pair').isString().notEmpty()], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }
    const pair = req.params['pair'] as string;
    const volume24h = await soroswap.getVolume24h(pair);
    return res.json({ success: true, data: { pair, volume24h }, timestamp: new Date() });
  } catch (error) {
    logger.error('Failed to get 24h volume:', error);
    return res.status(500).json({ success: false, error: 'Failed to get volume', message: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() });
  }
});

// GET /api/soroswap/route?pair=...&amount=...&side=BUY|SELL
router.get('/route', [
  query('pair').isString().notEmpty(),
  query('amount').isFloat({ gt: 0 }),
  query('side').isIn(['BUY', 'SELL'])
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }

    const { pair, side } = req.query as any;
    const amount = parseFloat(String(req.query['amount']));
    const route = await soroswap.getBestRoute(pair, amount, side);
    return res.json({ success: true, data: { pair, amount, side, route }, timestamp: new Date() });
  } catch (error) {
    logger.error('Failed to get best route:', error);
    return res.status(500).json({ success: false, error: 'Failed to get route', message: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() });
  }
});

// GET /api/soroswap/liquidity/:poolId
router.get('/liquidity/:poolId', [param('poolId').isString().notEmpty()], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstMsg = errors.array()[0]?.msg ?? 'Invalid input';
      return res.status(400).json({ success: false, error: 'Validation failed', message: firstMsg, timestamp: new Date() });
    }
    const poolId = req.params['poolId'] as string;
    const liquidity = await soroswap.getLiquidity(poolId);
    return res.json({ success: true, data: { poolId, ...liquidity }, timestamp: new Date() });
  } catch (error) {
    logger.error('Failed to get liquidity:', error);
    return res.status(500).json({ success: false, error: 'Failed to get liquidity', message: error instanceof Error ? error.message : 'Unknown error', timestamp: new Date() });
  }
});

export default router;


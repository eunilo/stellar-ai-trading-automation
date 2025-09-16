// Stellar AI Trading Automation - Simplified Main Application
// Focused on core functionality for Soroswap Hackathon

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env['PORT'] || 3000;
const HOST = process.env['HOST'] || 'localhost';
const strategyStatus = new Map<string, 'ACTIVE' | 'PAUSED'>();
const investorStates = new Map<string, {
  strategyId: string;
  balance: number;
  allocation: 'STABLE' | 'INVESTED';
  lastDecisionAt: Date;
}>();
let platformTotalFees = 0;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please try again later.',
    timestamp: new Date()
  }
});
app.use('/api', limiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: '2.0.0'
    },
    timestamp: new Date()
  });
});

// Metrics endpoint
app.get('/metrics', (_req, res) => {
  res.json({
    success: true,
    data: {
      requests: {
        total: 0,
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

// API Routes
app.get('/api/ai/predictions', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        symbol: 'XLM/USDC',
        prediction: 0.12 + Math.random() * 0.02,
        confidence: 0.8 + Math.random() * 0.2,
        timeframe: '1h',
        indicators: [],
        sentiment: 0.5,
        timestamp: new Date()
      }
    ],
    timestamp: new Date()
  });
});

app.post('/api/ai/analyze', (req, res) => {
  const { symbol } = req.body;
  res.json({
    success: true,
    data: {
      pair: symbol || 'XLM/USDC',
      action: Math.random() > 0.5 ? 'BUY' : 'SELL',
      price: 0.12 + Math.random() * 0.02,
      quantity: 100,
      confidence: 0.7 + Math.random() * 0.3,
      indicators: [],
      timestamp: new Date()
    },
    timestamp: new Date()
  });
});

app.get('/api/soroswap/pools', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'pool-1',
        tokenA: 'XLM',
        tokenB: 'USDC',
        reserveA: 1000000,
        reserveB: 120000,
        totalLiquidity: 1200000,
        fee: 0.003,
        apr: 0.15,
        volume24h: 50000
      }
    ],
    timestamp: new Date()
  });
});

app.post('/api/soroswap/quote', (req, res) => {
  const { pair, side, amount } = req.body;
  res.json({
    success: true,
    data: {
      pair: pair || 'XLM/USDC',
      side: side || 'BUY',
      inputAmount: amount || 100,
      outputAmount: (amount || 100) * (0.12 + Math.random() * 0.02),
      price: 0.12 + Math.random() * 0.02,
      priceImpact: 0.01,
      fee: (amount || 100) * 0.003,
      minimumReceived: (amount || 100) * 0.99,
      route: ['XLM', 'USDC'],
      timestamp: new Date()
    },
    timestamp: new Date()
  });
});

// Simple allocation decision: simulate AI/contract logic
function decideAllocation(): 'STABLE' | 'INVESTED' {
  // Positive pseudo-signal => INVEST, negative => STABLE
  const signal = Math.random() - 0.5; // -0.5..+0.5
  return signal > 0 ? 'INVESTED' : 'STABLE';
}

// Deposit endpoint simulating contract-controlled allocation and fee on switching
app.post('/api/strategy/deposit', (req, res) => {
  try {
    const investor = (req.body && req.body.investor) as string | undefined;
    const strategyId = (req.body && req.body.strategyId) as string | undefined;
    const amount = Number((req.body && req.body.amount) ?? 0);
    const asset = (req.body && req.body.asset) as string | undefined; // e.g., XLM/USDC

    if (!investor || !strategyId || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        message: 'Fields investor, strategyId and positive amount are required',
        timestamp: new Date()
      });
    }

    // Initialize or update investor state
    const current = investorStates.get(investor) || {
      strategyId,
      balance: 0,
      allocation: 'STABLE' as const,
      lastDecisionAt: new Date(0)
    };
    current.balance += amount;

    // Decide allocation (simulate .simulate() step)
    const simulatedDecision = decideAllocation();

    // Fee if allocation changes
    let feeCharged = 0;
    const feeRate = 0.005; // 0.5% on allocation switch
    if (current.allocation !== simulatedDecision) {
      feeCharged = Number((current.balance * feeRate).toFixed(8));
      current.balance = Number((current.balance - feeCharged).toFixed(8));
      platformTotalFees = Number((platformTotalFees + feeCharged).toFixed(8));
      // Here we could call SoroswapService.collectTransactionFee in the full backend
      // In this simplified server we just account the fee in-memory
    }

    // Apply decision (simulate .send_yes())
    current.allocation = simulatedDecision;
    current.lastDecisionAt = new Date();
    current.strategyId = strategyId;
    investorStates.set(investor, current);

    return res.json({
      success: true,
      data: {
        investor,
        strategyId,
        asset: asset || 'XLM',
        newBalance: current.balance,
        allocation: current.allocation,
        feeCharged,
        platformTotalFees,
        simulated: true,
        decidedAt: current.lastDecisionAt
      },
      timestamp: new Date()
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: 'Deposit failed',
      message: 'Unexpected error during strategy deposit',
      timestamp: new Date()
    });
  }
});

app.get('/api/strategies', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'grid-strategy-1',
        name: 'XLM/USDC Grid Strategy',
        type: 'GRID',
        status: strategyStatus.get('grid-strategy-1') || 'ACTIVE',
        config: {
          pair: 'XLM/USDC',
          amount: 1000,
          parameters: {
            gridSize: 10,
            gridSpacing: 0.01,
            priceRange: { min: 0.10, max: 0.15 }
          }
        },
        performance: {
          totalTrades: 15,
          winningTrades: 12,
          losingTrades: 3,
          winRate: 0.8,
          totalProfit: 150,
          totalLoss: 30,
          netProfit: 120,
          maxDrawdown: 0.05,
          sharpeRatio: 1.5,
          startDate: new Date(),
          lastUpdate: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    timestamp: new Date()
  });
});

// Minimal strategy control endpoints for demo (pause/resume)
app.post('/api/strategies/pause', (req, res) => {
  try {
    const id = (req.body && req.body.id) as string | undefined;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Validation failed', message: 'Strategy ID is required', timestamp: new Date() });
    }
    strategyStatus.set(id, 'PAUSED');
    return res.json({ success: true, message: `Strategy ${id} paused successfully`, timestamp: new Date() });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to pause strategy', message: 'Unexpected error', timestamp: new Date() });
  }
});

app.post('/api/strategies/resume', (req, res) => {
  try {
    const id = (req.body && req.body.id) as string | undefined;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Validation failed', message: 'Strategy ID is required', timestamp: new Date() });
    }
    strategyStatus.set(id, 'ACTIVE');
    return res.json({ success: true, message: `Strategy ${id} resumed successfully`, timestamp: new Date() });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to resume strategy', message: 'Unexpected error', timestamp: new Date() });
  }
});

app.get('/api/market/prices', (_req, res) => {
  res.json({
    success: true,
    data: [
      {
        symbol: 'XLM/USDC',
        price: 0.12 + Math.random() * 0.02,
        volume: 1000000 + Math.random() * 500000,
        change24h: (Math.random() - 0.5) * 0.1,
        changePercent24h: (Math.random() - 0.5) * 10,
        high24h: 0.13,
        low24h: 0.11,
        timestamp: new Date()
      }
    ],
    timestamp: new Date()
  });
});

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Stellar AI Trading Automation',
      version: '2.0.0',
      description: 'AI-Powered Trading and Yield Optimization on Stellar Ecosystem',
      endpoints: {
        health: '/health',
        metrics: '/metrics',
        ai: '/api/ai',
        soroswap: '/api/soroswap',
        strategies: '/api/strategies',
        market: '/api/market',
        deposit: '/api/strategy/deposit'
      }
    },
    timestamp: new Date()
  });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: 'Route not found',
    timestamp: new Date()
  });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: 'An error occurred while processing your request',
    timestamp: new Date()
  });
});

// Start server
app.listen(Number(PORT), HOST, () => {
  console.log(`🚀 Stellar AI Trading Automation started on ${HOST}:${PORT}`);
  console.log(`📊 Environment: ${process.env['NODE_ENV'] || 'development'}`);
  console.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
  console.log(`📈 Metrics: http://${HOST}:${PORT}/metrics`);
});

export default app;

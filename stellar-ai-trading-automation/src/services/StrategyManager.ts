// Stellar AI Trading Automation - Strategy Manager
// Manages trading strategies and execution

import { EventEmitter } from 'events';
import { config } from '../config';
import { logger } from '../utils/logger';
import { 
  Strategy, 
  StrategyType, 
  StrategyStatus, 
  TradingSignal, 
  TradeOrder,
  GridStrategyConfig,
  DCAStrategyConfig,
  MomentumStrategyConfig,
  ArbitrageStrategyConfig
} from '../types';
import { StellarService } from './StellarService';
import { SoroswapService } from './SoroswapService';
import { AIService } from './AIService';
import { MarketDataService } from './MarketDataService';

export class StrategyManager extends EventEmitter {
  private strategies: Map<string, Strategy> = new Map();
  private isRunning: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(
    private stellarService: StellarService,
    private soroswapService: SoroswapService,
    private aiService: AIService,
    private marketDataService: MarketDataService
  ) {
    super();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Strategy Manager...');
      
      // Load existing strategies from database
      await this.loadStrategies();
      
      // Start strategy monitoring
      this.startMonitoring();
      
      logger.info('Strategy Manager initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Strategy Manager:', error);
      throw error;
    }
  }

  private async loadStrategies(): Promise<void> {
    try {
      // In real implementation, this would load from database
      logger.info('Loading strategies from database...');
      
      // For now, create some example strategies
      const exampleStrategies = [
        this.createExampleGridStrategy(),
        this.createExampleDCAStrategy(),
        this.createExampleMomentumStrategy()
      ];

      exampleStrategies.forEach(strategy => {
        this.strategies.set(strategy.id, strategy);
      });

      logger.info(`${this.strategies.size} strategies loaded`);
    } catch (error) {
      logger.error('Failed to load strategies:', error);
      throw error;
    }
  }

  private createExampleGridStrategy(): Strategy {
    return {
      id: 'grid-strategy-1',
      name: 'XLM/USDC Grid Strategy',
      type: StrategyType.GRID,
      status: StrategyStatus.ACTIVE,
      config: {
        pair: 'XLM/USDC',
        amount: 1000,
        parameters: {
          gridSize: 10,
          gridSpacing: 0.01,
          priceRange: { min: 0.10, max: 0.15 },
          rebalanceThreshold: 0.05
        },
        riskManagement: {
          maxDrawdown: 0.1,
          stopLoss: 0.05,
          takeProfit: 0.2,
          maxPositionSize: 5000,
          maxDailyTrades: 50
        },
        notifications: {
          email: true,
          webhook: false,
          thresholds: {
            profit: 0.1,
            loss: 0.05,
            error: true
          }
        }
      },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        startDate: new Date(),
        lastUpdate: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createExampleDCAStrategy(): Strategy {
    return {
      id: 'dca-strategy-1',
      name: 'XLM DCA Strategy',
      type: StrategyType.DCA,
      status: StrategyStatus.ACTIVE,
      config: {
        pair: 'XLM/USDC',
        amount: 100,
        parameters: {
          interval: 60, // 1 hour
          amount: 100,
          maxInvestments: 24,
          priceThreshold: 0.12
        },
        riskManagement: {
          maxDrawdown: 0.15,
          stopLoss: 0.1,
          takeProfit: 0.3,
          maxPositionSize: 2400,
          maxDailyTrades: 24
        },
        notifications: {
          email: true,
          webhook: false,
          thresholds: {
            profit: 0.15,
            loss: 0.1,
            error: true
          }
        }
      },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        startDate: new Date(),
        lastUpdate: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private createExampleMomentumStrategy(): Strategy {
    return {
      id: 'momentum-strategy-1',
      name: 'XLM Momentum Strategy',
      type: StrategyType.MOMENTUM,
      status: StrategyStatus.ACTIVE,
      config: {
        pair: 'XLM/USDC',
        amount: 500,
        parameters: {
          lookbackPeriod: 20,
          momentumThreshold: 0.05,
          volumeThreshold: 1000000,
          indicators: ['RSI', 'MACD', 'BB']
        },
        riskManagement: {
          maxDrawdown: 0.2,
          stopLoss: 0.08,
          takeProfit: 0.25,
          maxPositionSize: 2500,
          maxDailyTrades: 10
        },
        notifications: {
          email: true,
          webhook: false,
          thresholds: {
            profit: 0.2,
            loss: 0.1,
            error: true
          }
        }
      },
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalProfit: 0,
        totalLoss: 0,
        netProfit: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        startDate: new Date(),
        lastUpdate: new Date()
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private startMonitoring(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.monitorInterval = setInterval(async () => {
      try {
        await this.monitorStrategies();
      } catch (error) {
        logger.error('Failed to monitor strategies:', error);
      }
    }, 60000); // Monitor every minute
  }

  private async monitorStrategies(): Promise<void> {
    try {
      for (const [id, strategy] of this.strategies) {
        if (strategy.status === StrategyStatus.ACTIVE) {
          await this.executeStrategy(strategy);
        }
      }
    } catch (error) {
      logger.error('Failed to monitor strategies:', error);
    }
  }

  private async executeStrategy(strategy: Strategy): Promise<void> {
    try {
      switch (strategy.type) {
        case StrategyType.GRID:
          await this.executeGridStrategy(strategy);
          break;
        case StrategyType.DCA:
          await this.executeDCAStrategy(strategy);
          break;
        case StrategyType.MOMENTUM:
          await this.executeMomentumStrategy(strategy);
          break;
        case StrategyType.ARBITRAGE:
          await this.executeArbitrageStrategy(strategy);
          break;
        default:
          logger.warn(`Unknown strategy type: ${strategy.type}`);
      }
    } catch (error) {
      logger.error(`Failed to execute strategy ${strategy.id}:`, error);
    }
  }

  private async executeGridStrategy(strategy: Strategy): Promise<void> {
    try {
      const config = strategy.config as GridStrategyConfig;
      const currentPrice = await this.marketDataService.getPrice(config.pair);
      
      // Check if price is within grid range
      if (currentPrice < config.parameters.priceRange.min || 
          currentPrice > config.parameters.priceRange.max) {
        return;
      }

      // Calculate grid levels
      const gridLevels = this.calculateGridLevels(config.parameters);
      
      // Check for buy/sell opportunities
      for (const level of gridLevels) {
        if (Math.abs(currentPrice - level.price) < config.parameters.gridSpacing) {
          const signal: TradingSignal = {
            pair: config.pair,
            action: level.type === 'buy' ? 'BUY' : 'SELL',
            price: level.price,
            quantity: config.amount / level.price,
            confidence: 0.8,
            indicators: [],
            timestamp: new Date()
          };

          await this.executeTrade(strategy, signal);
        }
      }
    } catch (error) {
      logger.error('Failed to execute grid strategy:', error);
    }
  }

  private calculateGridLevels(parameters: any): Array<{ price: number; type: 'buy' | 'sell' }> {
    const levels = [];
    const { priceRange, gridSize, gridSpacing } = parameters;
    
    for (let i = 0; i < gridSize; i++) {
      const price = priceRange.min + (i * gridSpacing);
      levels.push({ price, type: 'buy' });
      levels.push({ price: price + gridSpacing, type: 'sell' });
    }
    
    return levels;
  }

  private async executeDCAStrategy(strategy: Strategy): Promise<void> {
    try {
      const config = strategy.config as DCAStrategyConfig;
      const currentPrice = await this.marketDataService.getPrice(config.pair);
      
      // Check if price is below threshold
      if (currentPrice > config.parameters.priceThreshold) {
        return;
      }

      // Check if we haven't exceeded max investments
      if (strategy.performance.totalTrades >= config.parameters.maxInvestments) {
        return;
      }

      const signal: TradingSignal = {
        pair: config.pair,
        action: 'BUY',
        price: currentPrice,
        quantity: config.parameters.amount / currentPrice,
        confidence: 0.9,
        indicators: [],
        timestamp: new Date()
      };

      await this.executeTrade(strategy, signal);
    } catch (error) {
      logger.error('Failed to execute DCA strategy:', error);
    }
  }

  private async executeMomentumStrategy(strategy: Strategy): Promise<void> {
    try {
      const config = strategy.config as MomentumStrategyConfig;
      const signal = await this.aiService.analyzeMarket(config.pair);
      
      // Check if signal meets confidence threshold
      if (signal.confidence < 0.7) {
        return;
      }

      // Check volume threshold
      const volume = await this.marketDataService.getVolume24h(config.pair);
      if (volume < config.parameters.volumeThreshold) {
        return;
      }

      signal.quantity = config.amount / signal.price;
      await this.executeTrade(strategy, signal);
    } catch (error) {
      logger.error('Failed to execute momentum strategy:', error);
    }
  }

  private async executeArbitrageStrategy(strategy: Strategy): Promise<void> {
    try {
      const config = strategy.config as ArbitrageStrategyConfig;
      
      // Get prices from different sources
      const [soroswapPrice, reflectorPrice] = await Promise.all([
        this.soroswapService.getPrice(config.pair),
        this.marketDataService.getPrice(config.pair)
      ]);

      const spread = Math.abs(soroswapPrice - reflectorPrice) / Math.min(soroswapPrice, reflectorPrice);
      
      if (spread > config.parameters.minSpread && spread < config.parameters.maxSpread) {
        const signal: TradingSignal = {
          pair: config.pair,
          action: soroswapPrice < reflectorPrice ? 'BUY' : 'SELL',
          price: soroswapPrice,
          quantity: config.amount / soroswapPrice,
          confidence: 0.95,
          indicators: [],
          timestamp: new Date()
        };

        await this.executeTrade(strategy, signal);
      }
    } catch (error) {
      logger.error('Failed to execute arbitrage strategy:', error);
    }
  }

  private async executeTrade(strategy: Strategy, signal: TradingSignal): Promise<void> {
    try {
      // Create trade order
      const order: TradeOrder = {
        id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        pair: signal.pair,
        side: signal.action,
        type: 'MARKET',
        quantity: signal.quantity,
        price: signal.price,
        status: 'PENDING',
        filledQuantity: 0,
        averagePrice: 0,
        fees: 0,
        timestamp: new Date(),
        updatedAt: new Date()
      };

      // Execute trade via Soroswap
      const tradeRequest = {
        pair: signal.pair,
        side: signal.action,
        amount: signal.quantity,
        slippageTolerance: 0.5,
        deadline: Date.now() + 300000, // 5 minutes
        recipient: 'your-stellar-address' // In real implementation, this would be dynamic
      };

      const tradeResponse = await this.soroswapService.executeTrade(tradeRequest);
      
      // Update order with trade response
      order.status = 'FILLED';
      order.filledQuantity = tradeResponse.outputAmount;
      order.averagePrice = tradeResponse.price;
      order.fees = tradeResponse.fee;
      order.updatedAt = new Date();

      // Update strategy performance
      this.updateStrategyPerformance(strategy, order);

      // Emit trading signal event
      this.emit('trading_signal', signal);
      this.emit('strategy_update', strategy);

      logger.info(`Trade executed for strategy ${strategy.id}:`, order);
    } catch (error) {
      logger.error('Failed to execute trade:', error);
      throw error;
    }
  }

  private updateStrategyPerformance(strategy: Strategy, order: TradeOrder): void {
    const performance = strategy.performance;
    
    performance.totalTrades++;
    performance.lastUpdate = new Date();
    
    if (order.status === 'FILLED') {
      const profit = order.side === 'BUY' ? 
        (order.averagePrice - order.price) * order.filledQuantity :
        (order.price - order.averagePrice) * order.filledQuantity;
      
      if (profit > 0) {
        performance.winningTrades++;
        performance.totalProfit += profit;
      } else {
        performance.losingTrades++;
        performance.totalLoss += Math.abs(profit);
      }
      
      performance.netProfit = performance.totalProfit - performance.totalLoss;
      performance.winRate = performance.winningTrades / performance.totalTrades;
    }
  }

  async createStrategy(strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt' | 'performance'>): Promise<Strategy> {
    try {
      const newStrategy: Strategy = {
        ...strategy,
        id: `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        performance: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalProfit: 0,
          totalLoss: 0,
          netProfit: 0,
          maxDrawdown: 0,
          sharpeRatio: 0,
          startDate: new Date(),
          lastUpdate: new Date()
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.strategies.set(newStrategy.id, newStrategy);
      
      logger.info(`Strategy created: ${newStrategy.id}`);
      return newStrategy;
    } catch (error) {
      logger.error('Failed to create strategy:', error);
      throw error;
    }
  }

  async getStrategies(): Promise<Strategy[]> {
    return Array.from(this.strategies.values());
  }

  async getStrategy(id: string): Promise<Strategy | null> {
    return this.strategies.get(id) || null;
  }

  async startStrategy(id: string): Promise<void> {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    strategy.status = StrategyStatus.ACTIVE;
    strategy.updatedAt = new Date();
    
    logger.info(`Strategy started: ${id}`);
    this.emit('strategy_update', strategy);
  }

  async stopStrategy(id: string): Promise<void> {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    strategy.status = StrategyStatus.STOPPED;
    strategy.updatedAt = new Date();
    
    logger.info(`Strategy stopped: ${id}`);
    this.emit('strategy_update', strategy);
  }

  async pauseStrategy(id: string): Promise<void> {
    const strategy = this.strategies.get(id);
    if (!strategy) {
      throw new Error('Strategy not found');
    }

    strategy.status = StrategyStatus.PAUSED;
    strategy.updatedAt = new Date();
    
    logger.info(`Strategy paused: ${id}`);
    this.emit('strategy_update', strategy);
  }

  async stop(): Promise<void> {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.isRunning = false;
    logger.info('Strategy Manager stopped');
  }
}

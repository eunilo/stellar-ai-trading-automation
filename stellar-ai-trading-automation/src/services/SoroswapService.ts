// Stellar AI Trading Automation - Soroswap DEX Service
// Manages Soroswap DEX interactions for trading

import axios from 'axios';
import { config } from '../config';
import { logger } from '../utils/logger';
import { QuoteRequest, QuoteResponse, TradeRequest, TradeResponse, PoolInfo } from '../types';

export class SoroswapService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = config.soroswap.apiUrl;
    this.apiKey = config.soroswap.apiKey;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Soroswap service...');
      
      // Test API connection
      await this.getPools();
      
      logger.info('Soroswap service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Soroswap service:', error);
      throw error;
    }
  }

  async getPools(): Promise<PoolInfo[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/pools`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((pool: any) => ({
        id: pool.id,
        tokenA: pool.tokenA,
        tokenB: pool.tokenB,
        reserveA: parseFloat(pool.reserveA),
        reserveB: parseFloat(pool.reserveB),
        totalLiquidity: parseFloat(pool.totalLiquidity),
        fee: parseFloat(pool.fee),
        apr: parseFloat(pool.apr || '0'),
        volume24h: parseFloat(pool.volume24h || '0')
      }));
    } catch (error) {
      logger.error('Failed to get pools:', error);
      throw error;
    }
  }

  async getQuote(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/quote`, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        pair: response.data.pair,
        side: response.data.side,
        inputAmount: parseFloat(response.data.inputAmount),
        outputAmount: parseFloat(response.data.outputAmount),
        price: parseFloat(response.data.price),
        priceImpact: parseFloat(response.data.priceImpact),
        fee: parseFloat(response.data.fee),
        minimumReceived: parseFloat(response.data.minimumReceived),
        route: response.data.route || [],
        timestamp: new Date(response.data.timestamp)
      };
    } catch (error) {
      logger.error('Failed to get quote:', error);
      throw error;
    }
  }

  async executeTrade(request: TradeRequest): Promise<TradeResponse> {
    try {
      const response = await axios.post(`${this.apiUrl}/trade`, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        transactionHash: response.data.transactionHash,
        pair: response.data.pair,
        side: response.data.side,
        inputAmount: parseFloat(response.data.inputAmount),
        outputAmount: parseFloat(response.data.outputAmount),
        price: parseFloat(response.data.price),
        fee: parseFloat(response.data.fee),
        timestamp: new Date(response.data.timestamp)
      };
    } catch (error) {
      logger.error('Failed to execute trade:', error);
      throw error;
    }
  }

  async getPoolInfo(poolId: string): Promise<PoolInfo | null> {
    try {
      const pools = await this.getPools();
      return pools.find(pool => pool.id === poolId) || null;
    } catch (error) {
      logger.error('Failed to get pool info:', error);
      throw error;
    }
  }

  async getBestRoute(pair: string, amount: number, side: 'BUY' | 'SELL'): Promise<string[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/route`, {
        pair,
        amount,
        side
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.route || [];
    } catch (error) {
      logger.error('Failed to get best route:', error);
      throw error;
    }
  }

  async getLiquidity(poolId: string): Promise<{ tokenA: number; tokenB: number; total: number }> {
    try {
      const pool = await this.getPoolInfo(poolId);
      if (!pool) {
        throw new Error('Pool not found');
      }

      return {
        tokenA: pool.reserveA,
        tokenB: pool.reserveB,
        total: pool.totalLiquidity
      };
    } catch (error) {
      logger.error('Failed to get liquidity:', error);
      throw error;
    }
  }

  async getPrice(pair: string): Promise<number> {
    try {
      const response = await axios.get(`${this.apiUrl}/price/${pair}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return parseFloat(response.data.price);
    } catch (error) {
      logger.error('Failed to get price:', error);
      throw error;
    }
  }

  async getVolume24h(pair: string): Promise<number> {
    try {
      const response = await axios.get(`${this.apiUrl}/volume/${pair}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return parseFloat(response.data.volume24h);
    } catch (error) {
      logger.error('Failed to get 24h volume:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('Soroswap service stopped');
  }
}

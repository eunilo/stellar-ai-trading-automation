// Stellar AI Trading Automation - Market Data Service
// Manages market data collection and processing

import axios from 'axios';
import { EventEmitter } from 'events';
import { config } from '../config';
import { logger } from '../utils/logger';
import { MarketData, PriceData, PriceHistory } from '../types';

export class MarketDataService extends EventEmitter {
  private isRunning: boolean = false;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Market Data service...');
      
      // Start market data updates
      this.startMarketDataUpdates();
      
      logger.info('Market Data service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Market Data service:', error);
      throw error;
    }
  }

  private startMarketDataUpdates(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.updateInterval = setInterval(async () => {
      try {
        await this.updateMarketData();
      } catch (error) {
        logger.error('Failed to update market data:', error);
      }
    }, 30000); // Update every 30 seconds
  }

  private async updateMarketData(): Promise<void> {
    try {
      const marketData = await this.fetchMarketData();
      
      // Emit market data events
      this.emit('market_data', marketData);
      
      logger.debug('Market data updated successfully');
    } catch (error) {
      logger.error('Failed to update market data:', error);
    }
  }

  async fetchMarketData(): Promise<MarketData[]> {
    try {
      // Fetch from multiple sources for reliability
      const [soroswapData, reflectorData] = await Promise.allSettled([
        this.fetchFromSoroswap(),
        this.fetchFromReflector()
      ]);

      const marketData: MarketData[] = [];

      // Process Soroswap data
      if (soroswapData.status === 'fulfilled') {
        marketData.push(...soroswapData.value);
      }

      // Process Reflector data
      if (reflectorData.status === 'fulfilled') {
        marketData.push(...reflectorData.value);
      }

      return marketData;
    } catch (error) {
      logger.error('Failed to fetch market data:', error);
      throw error;
    }
  }

  private async fetchFromSoroswap(): Promise<MarketData[]> {
    try {
      const response = await axios.get(`${config.soroswap.apiUrl}/market-data`, {
        headers: {
          'Authorization': `Bearer ${config.soroswap.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((item: any) => ({
        symbol: item.symbol,
        price: parseFloat(item.price),
        volume: parseFloat(item.volume),
        change24h: parseFloat(item.change24h),
        changePercent24h: parseFloat(item.changePercent24h),
        high24h: parseFloat(item.high24h),
        low24h: parseFloat(item.low24h),
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to fetch from Soroswap:', error);
      return [];
    }
  }

  private async fetchFromReflector(): Promise<MarketData[]> {
    try {
      const response = await axios.get(`${config.reflector.apiUrl}/prices`, {
        headers: {
          'Authorization': `Bearer ${config.reflector.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.map((item: any) => ({
        symbol: item.symbol,
        price: parseFloat(item.price),
        volume: parseFloat(item.volume || '0'),
        change24h: parseFloat(item.change24h || '0'),
        changePercent24h: parseFloat(item.changePercent24h || '0'),
        high24h: parseFloat(item.high24h || item.price),
        low24h: parseFloat(item.low24h || item.price),
        timestamp: new Date(item.timestamp)
      }));
    } catch (error) {
      logger.error('Failed to fetch from Reflector:', error);
      return [];
    }
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const marketData = await this.fetchMarketData();
      const data = marketData.find(item => item.symbol === symbol);
      
      if (!data) {
        throw new Error(`Price data not found for ${symbol}`);
      }

      return data.price;
    } catch (error) {
      logger.error(`Failed to get price for ${symbol}:`, error);
      throw error;
    }
  }

  async getPriceHistory(symbol: string, interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '1h'): Promise<PriceHistory> {
    try {
      const response = await axios.get(`${config.reflector.apiUrl}/history/${symbol}`, {
        params: { interval },
        headers: {
          'Authorization': `Bearer ${config.reflector.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = response.data.map((item: any) => ({
        symbol: item.symbol,
        price: parseFloat(item.price),
        timestamp: new Date(item.timestamp),
        source: 'reflector',
        confidence: parseFloat(item.confidence || '0.9')
      }));

      return {
        symbol,
        data,
        interval,
        startTime: new Date(data[0]?.timestamp || Date.now()),
        endTime: new Date(data[data.length - 1]?.timestamp || Date.now())
      };
    } catch (error) {
      logger.error(`Failed to get price history for ${symbol}:`, error);
      throw error;
    }
  }

  async getVolume24h(symbol: string): Promise<number> {
    try {
      const marketData = await this.fetchMarketData();
      const data = marketData.find(item => item.symbol === symbol);
      
      if (!data) {
        throw new Error(`Volume data not found for ${symbol}`);
      }

      return data.volume;
    } catch (error) {
      logger.error(`Failed to get volume for ${symbol}:`, error);
      throw error;
    }
  }

  async getMarketTrends(): Promise<{ symbol: string; trend: 'up' | 'down' | 'sideways'; strength: number }[]> {
    try {
      const marketData = await this.fetchMarketData();
      
      return marketData.map(data => {
        const changePercent = data.changePercent24h;
        let trend: 'up' | 'down' | 'sideways' = 'sideways';
        let strength = 0;

        if (changePercent > 5) {
          trend = 'up';
          strength = Math.min(1, changePercent / 20);
        } else if (changePercent < -5) {
          trend = 'down';
          strength = Math.min(1, Math.abs(changePercent) / 20);
        } else {
          strength = 1 - Math.abs(changePercent) / 5;
        }

        return {
          symbol: data.symbol,
          trend,
          strength
        };
      });
    } catch (error) {
      logger.error('Failed to get market trends:', error);
      throw error;
    }
  }

  async getTopGainers(): Promise<MarketData[]> {
    try {
      const marketData = await this.fetchMarketData();
      
      return marketData
        .filter(data => data.changePercent24h > 0)
        .sort((a, b) => b.changePercent24h - a.changePercent24h)
        .slice(0, 10);
    } catch (error) {
      logger.error('Failed to get top gainers:', error);
      throw error;
    }
  }

  async getTopLosers(): Promise<MarketData[]> {
    try {
      const marketData = await this.fetchMarketData();
      
      return marketData
        .filter(data => data.changePercent24h < 0)
        .sort((a, b) => a.changePercent24h - b.changePercent24h)
        .slice(0, 10);
    } catch (error) {
      logger.error('Failed to get top losers:', error);
      throw error;
    }
  }

  async getMarketCap(symbol: string): Promise<number> {
    try {
      // Simplified market cap calculation
      const price = await this.getPrice(symbol);
      const volume = await this.getVolume24h(symbol);
      
      // Estimate market cap based on price and volume
      return price * volume * 1000; // Rough estimation
    } catch (error) {
      logger.error(`Failed to get market cap for ${symbol}:`, error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    
    this.isRunning = false;
    logger.info('Market Data service stopped');
  }
}

// Stellar AI Trading Automation - Core Types
// Defines all TypeScript interfaces and types used throughout the application

export interface StellarAccount {
  publicKey: string;
  secretKey: string;
  balance: string;
  sequence: string;
}

export interface TradingPair {
  base: string;
  quote: string;
  symbol: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  timestamp: Date;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  timestamp: Date;
}

export interface TradingSignal {
  pair: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  price: number;
  quantity: number;
  confidence: number;
  indicators: TechnicalIndicator[];
  timestamp: Date;
}

export interface TradeOrder {
  id: string;
  pair: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT' | 'STOP';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';
  filledQuantity: number;
  averagePrice: number;
  fees: number;
  timestamp: Date;
  updatedAt: Date;
}

export interface Strategy {
  id: string;
  name: string;
  type: 'GRID' | 'DCA' | 'MOMENTUM' | 'ARBITRAGE';
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED';
  config: StrategyConfig;
  performance: StrategyPerformance;
  createdAt: Date;
  updatedAt: Date;
}

export interface StrategyConfig {
  pair: string;
  amount: number;
  parameters: Record<string, any>;
  riskManagement: RiskManagement;
  notifications: NotificationSettings;
}

export interface RiskManagement {
  maxDrawdown: number;
  stopLoss: number;
  takeProfit: number;
  maxPositionSize: number;
  maxDailyTrades: number;
}

export interface NotificationSettings {
  email: boolean;
  webhook: boolean;
  webhookUrl?: string;
  thresholds: {
    profit: number;
    loss: number;
    error: boolean;
  };
}

export interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfit: number;
  totalLoss: number;
  netProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
  startDate: Date;
  lastUpdate: Date;
}

export interface GridStrategyConfig extends StrategyConfig {
  parameters: {
    gridSize: number;
    gridSpacing: number;
    priceRange: {
      min: number;
      max: number;
    };
    rebalanceThreshold: number;
  };
}

export interface DCAStrategyConfig extends StrategyConfig {
  parameters: {
    interval: number; // in minutes
    amount: number;
    maxInvestments: number;
    priceThreshold: number;
  };
}

export interface MomentumStrategyConfig extends StrategyConfig {
  parameters: {
    lookbackPeriod: number;
    momentumThreshold: number;
    volumeThreshold: number;
    indicators: string[];
  };
}

export interface ArbitrageStrategyConfig extends StrategyConfig {
  parameters: {
    minSpread: number;
    maxSpread: number;
    executionDelay: number;
    maxSlippage: number;
  };
}

export interface PoolInfo {
  id: string;
  tokenA: string;
  tokenB: string;
  reserveA: number;
  reserveB: number;
  totalLiquidity: number;
  fee: number;
  apr: number;
  volume24h: number;
}

export interface QuoteRequest {
  pair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  slippageTolerance: number;
}

export interface QuoteResponse {
  pair: string;
  side: 'BUY' | 'SELL';
  inputAmount: number;
  outputAmount: number;
  price: number;
  priceImpact: number;
  fee: number;
  minimumReceived: number;
  route: string[];
  timestamp: Date;
}

export interface TradeRequest {
  pair: string;
  side: 'BUY' | 'SELL';
  amount: number;
  slippageTolerance: number;
  deadline: number;
  recipient: string;
}

export interface TradeResponse {
  transactionHash: string;
  pair: string;
  side: 'BUY' | 'SELL';
  inputAmount: number;
  outputAmount: number;
  price: number;
  fee: number;
  timestamp: Date;
}

export interface YieldOpportunity {
  id: string;
  protocol: string;
  asset: string;
  apy: number;
  tvl: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  minDeposit: number;
  maxDeposit: number;
  lockPeriod: number;
  fees: number;
  description: string;
  createdAt: Date;
}

export interface YieldPosition {
  id: string;
  opportunityId: string;
  amount: number;
  apy: number;
  startDate: Date;
  endDate?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  rewards: number;
  fees: number;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: Date;
  source: string;
  confidence: number;
}

export interface PriceHistory {
  symbol: string;
  data: PriceData[];
  interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  startTime: Date;
  endTime: Date;
}

export interface AIPrediction {
  symbol: string;
  prediction: number;
  confidence: number;
  timeframe: string;
  indicators: TechnicalIndicator[];
  sentiment: number;
  timestamp: Date;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'LSTM' | 'GRU' | 'CNN' | 'TRANSFORMER';
  version: string;
  accuracy: number;
  lastTrained: Date;
  status: 'TRAINING' | 'READY' | 'ERROR';
  config: Record<string, any>;
}

export interface TrainingData {
  symbol: string;
  features: number[][];
  targets: number[];
  timestamps: Date[];
  indicators: TechnicalIndicator[][];
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  mse: number;
  mae: number;
  r2Score: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code: string;
  timestamp: Date;
  details?: any;
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: Date;
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    stellar: 'up' | 'down';
    soroswap: 'up' | 'down';
    ai: 'up' | 'down';
  };
  uptime: number;
  memory: {
    used: number;
    free: number;
    total: number;
  };
  cpu: {
    usage: number;
  };
}

export interface Metrics {
  requests: {
    total: number;
    successful: number;
    failed: number;
    averageResponseTime: number;
  };
  trading: {
    totalTrades: number;
    successfulTrades: number;
    failedTrades: number;
    totalVolume: number;
    totalFees: number;
  };
  ai: {
    predictions: number;
    accuracy: number;
    averageConfidence: number;
  };
  system: {
    uptime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

// Enums
export enum StrategyType {
  GRID = 'GRID',
  DCA = 'DCA',
  MOMENTUM = 'MOMENTUM',
  ARBITRAGE = 'ARBITRAGE'
}

export enum StrategyStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED'
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP'
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  PUSH = 'PUSH'
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type NonNullable<T> = T extends null | undefined ? never : T;

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

export type NumberKeys<T> = {
  [K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

export type DateKeys<T> = {
  [K in keyof T]: T[K] extends Date ? K : never;
}[keyof T];

// Event types
export interface TradeEvent {
  type: 'TRADE_EXECUTED' | 'TRADE_FAILED' | 'TRADE_CANCELLED';
  trade: TradeOrder;
  timestamp: Date;
}

export interface StrategyEvent {
  type: 'STRATEGY_STARTED' | 'STRATEGY_STOPPED' | 'STRATEGY_PAUSED' | 'STRATEGY_RESUMED';
  strategy: Strategy;
  timestamp: Date;
}

export interface AIEvent {
  type: 'MODEL_TRAINED' | 'PREDICTION_MADE' | 'MODEL_ERROR';
  data: any;
  timestamp: Date;
}

export interface SystemEvent {
  type: 'HEALTH_CHECK' | 'ERROR' | 'WARNING' | 'INFO';
  message: string;
  data?: any;
  timestamp: Date;
}

export type AppEvent = TradeEvent | StrategyEvent | AIEvent | SystemEvent;

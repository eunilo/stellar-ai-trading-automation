// Stellar AI Trading Automation - Configuration
// Centralized configuration management with environment variable support

import { config as dotenvConfig } from 'dotenv';

// Load environment variables
dotenvConfig();

interface Config {
  nodeEnv: string;
  port: number;
  host: string;
  database: {
    host: string;
    port: number;
    name: string;
    username: string;
    password: string;
    sync: boolean;
    logging: boolean;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    db: number;
  };
  stellar: {
    network: string;
    horizonUrl: string;
    sorobanRpcUrl: string;
    friendBotUrl: string;
  };
  soroswap: {
    apiUrl: string;
    apiKey: string;
    slippageTolerance: number;
    deadline: number;
  };
  defindex: {
    apiUrl: string;
    apiKey: string;
  };
  reflector: {
    apiUrl: string;
    apiKey: string;
  };
  ai: {
    modelPath: string;
    trainingDataPath: string;
    predictionInterval: number;
    confidenceThreshold: number;
  };
  security: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshExpiresIn: string;
    encryptionKey: string;
    bcryptRounds: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  logging: {
    level: string;
    filePath: string;
    maxSize: string;
    maxFiles: string;
  };
  monitoring: {
    prometheusEnabled: boolean;
    prometheusPort: number;
    healthCheckInterval: number;
  };
  trading: {
    defaultPair: string;
    minTradeAmount: number;
    maxTradeAmount: number;
    tradingFeePercentage: number;
  };
  strategies: {
    gridEnabled: boolean;
    dcaEnabled: boolean;
    momentumEnabled: boolean;
    arbitrageEnabled: boolean;
  };
  websocket: {
    enabled: boolean;
    port: number;
    corsOrigin: string;
  };
  cors: {
    origin: string;
    credentials: boolean;
    methods: string[];
    headers: string;
  };
  externalApis: {
    coinmarketcapApiKey: string;
    coingeckoApiKey: string;
  };
  development: {
    debugMode: boolean;
    mockExternalApis: boolean;
    enableSwagger: boolean;
    swaggerPath: string;
  };
}

const config: Config = {
  nodeEnv: process.env['NODE_ENV'] || 'development',
  port: parseInt(process.env['PORT'] || '3000', 10),
  host: process.env['HOST'] || 'localhost',
  
  database: {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432', 10),
    name: process.env['DB_NAME'] || 'stellar_defi',
    username: process.env['DB_USERNAME'] || 'postgres',
    password: process.env['DB_PASSWORD'] || '',
    sync: process.env['DB_SYNC'] === 'true',
    logging: process.env['DB_LOGGING'] === 'true'
  },
  
  redis: {
    host: process.env['REDIS_HOST'] || 'localhost',
    port: parseInt(process.env['REDIS_PORT'] || '6379', 10),
    password: process.env['REDIS_PASSWORD'],
    db: parseInt(process.env['REDIS_DB'] || '0', 10)
  },
  
  stellar: {
    network: process.env['STELLAR_NETWORK'] || 'testnet',
    horizonUrl: process.env['STELLAR_HORIZON_URL'] || 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: process.env['STELLAR_SOROBAN_RPC_URL'] || 'https://soroban-testnet.stellar.org',
    friendBotUrl: process.env['STELLAR_FRIEND_BOT_URL'] || 'https://friendbot.stellar.org'
  },
  
  soroswap: {
    apiUrl: process.env['SOROSWAP_API_URL'] || 'https://api.soroswap.finance',
    apiKey: process.env['SOROSWAP_API_KEY'] || '',
    slippageTolerance: parseFloat(process.env['SOROSWAP_SLIPPAGE_TOLERANCE'] || '0.5'),
    deadline: parseInt(process.env['SOROSWAP_DEADLINE'] || '300', 10)
  },
  
  defindex: {
    apiUrl: process.env['DEFINDEX_API_URL'] || 'https://api.defindex.finance',
    apiKey: process.env['DEFINDEX_API_KEY'] || ''
  },
  
  reflector: {
    apiUrl: process.env['REFLECTOR_API_URL'] || 'https://api.reflector.finance',
    apiKey: process.env['REFLECTOR_API_KEY'] || ''
  },
  
  ai: {
    modelPath: process.env['AI_MODEL_PATH'] || './models',
    trainingDataPath: process.env['AI_TRAINING_DATA_PATH'] || './data',
    predictionInterval: parseInt(process.env['AI_PREDICTION_INTERVAL'] || '60000', 10),
    confidenceThreshold: parseFloat(process.env['AI_CONFIDENCE_THRESHOLD'] || '0.7')
  },
  
  security: {
    jwtSecret: process.env['JWT_SECRET'] || 'your_jwt_secret_here_make_it_long_and_random',
    jwtExpiresIn: process.env['JWT_EXPIRES_IN'] || '24h',
    jwtRefreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
    encryptionKey: process.env['ENCRYPTION_KEY'] || 'your_encryption_key_here_32_chars',
    bcryptRounds: parseInt(process.env['BCRYPT_ROUNDS'] || '12', 10)
  },
  
  rateLimit: {
    windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10),
    skipSuccessfulRequests: process.env['RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS'] === 'true'
  },
  
  logging: {
    level: process.env['LOG_LEVEL'] || 'info',
    filePath: process.env['LOG_FILE_PATH'] || './logs',
    maxSize: process.env['LOG_MAX_SIZE'] || '20m',
    maxFiles: process.env['LOG_MAX_FILES'] || '14d'
  },
  
  monitoring: {
    prometheusEnabled: process.env['PROMETHEUS_ENABLED'] === 'true',
    prometheusPort: parseInt(process.env['PROMETHEUS_PORT'] || '9090', 10),
    healthCheckInterval: parseInt(process.env['HEALTH_CHECK_INTERVAL'] || '30000', 10)
  },
  
  trading: {
    defaultPair: process.env['DEFAULT_TRADING_PAIR'] || 'XLM/USDC',
    minTradeAmount: parseFloat(process.env['MIN_TRADE_AMOUNT'] || '10'),
    maxTradeAmount: parseFloat(process.env['MAX_TRADE_AMOUNT'] || '10000'),
    tradingFeePercentage: parseFloat(process.env['TRADING_FEE_PERCENTAGE'] || '0.3')
  },
  
  strategies: {
    gridEnabled: process.env['GRID_STRATEGY_ENABLED'] === 'true',
    dcaEnabled: process.env['DCA_STRATEGY_ENABLED'] === 'true',
    momentumEnabled: process.env['MOMENTUM_STRATEGY_ENABLED'] === 'true',
    arbitrageEnabled: process.env['ARBITRAGE_STRATEGY_ENABLED'] === 'true'
  },
  
  websocket: {
    enabled: process.env['WS_ENABLED'] === 'true',
    port: parseInt(process.env['WS_PORT'] || '3001', 10),
    corsOrigin: process.env['WS_CORS_ORIGIN'] || '*'
  },
  
  cors: {
    origin: process.env['CORS_ORIGIN'] || '*',
    credentials: process.env['CORS_CREDENTIALS'] === 'true',
    methods: (process.env['CORS_METHODS'] || 'GET,POST,PUT,DELETE,OPTIONS').split(','),
    headers: process.env['CORS_HEADERS'] || 'Content-Type,Authorization'
  },
  
  externalApis: {
    coinmarketcapApiKey: process.env['COINMARKETCAP_API_KEY'] || '',
    coingeckoApiKey: process.env['COINGECKO_API_KEY'] || ''
  },
  
  development: {
    debugMode: process.env['DEBUG_MODE'] === 'true',
    mockExternalApis: process.env['MOCK_EXTERNAL_APIS'] === 'true',
    enableSwagger: process.env['ENABLE_SWAGGER'] === 'true',
    swaggerPath: process.env['SWAGGER_PATH'] || '/api-docs'
  }
};

// Validation
const validateConfig = (): void => {
  const requiredFields = [
    'security.jwtSecret',
    'security.encryptionKey',
    'soroswap.apiKey',
    'defindex.apiKey',
    'reflector.apiKey'
  ];

  const missingFields: string[] = [];

  requiredFields.forEach(field => {
    const keys = field.split('.');
    let value: any = config;
    
    for (const key of keys) {
      value = value[key];
    }
    
    if (!value || value === 'your_jwt_secret_here_make_it_long_and_random' || 
        value === 'your_encryption_key_here_32_chars') {
      missingFields.push(field);
    }
  });

  if (missingFields.length > 0) {
    console.error('❌ Missing required configuration fields:');
    missingFields.forEach(field => {
      console.error(`   - ${field}`);
    });
    console.error('\nPlease check your .env file and ensure all required fields are set.');
    process.exit(1);
  }
};

// Validate configuration on startup
if (config.nodeEnv === 'production') {
  validateConfig();
}

export { config };
export default config;

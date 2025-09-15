# 🌟 Stellar AI Trading Automation

**Intelligent Trading and Yield Optimization System on Stellar Ecosystem**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Stellar](https://img.shields.io/badge/Stellar-7D00FF?logo=stellar&logoColor=white)](https://stellar.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

## 🚀 Overview

**Stellar AI Trading Automation** is a revolutionary platform that combines artificial intelligence, machine learning, and DeFi protocols to automate trading operations and yield optimization on the Stellar ecosystem. Developed specifically for **Meridian 2025**, this project demonstrates the future of intelligent trading on the Stellar blockchain.

### ✨ Key Features

- 🤖 **Advanced AI**: Machine learning models with TensorFlow.js and Brain.js
- 🔄 **Automated Trading**: Complete integration with Soroswap DEX
- 📊 **Technical Analysis**: 15+ advanced technical indicators
- 💰 **Yield Optimization**: Integration with Defindex for yield farming
- 🔒 **Security First**: Multi-layer security with threat modeling
- 📈 **Real-time Data**: Live market data from Reflector oracles
- 🎯 **Smart Strategies**: Grid, DCA, Momentum, and Arbitrage strategies
- 🐳 **Docker Ready**: Complete containerization for easy deployment

## 🏗️ Architecture

### Backend (Node.js/TypeScript)
- **StellarService**: Blockchain interactions and account management
- **SoroswapService**: DEX integration for trading operations
- **AIService**: Machine learning for market analysis
- **MarketDataService**: Real-time market data processing
- **StrategyManager**: Automated trading strategy execution

### Smart Contracts (Rust/Soroban)
- **Trading Contract**: Automated trading logic
- **Yield Contract**: Yield farming optimization
- **Oracle Contract**: Price feed management

### Frontend (React/TypeScript)
- **Dashboard**: Real-time trading interface
- **Strategy Builder**: Visual strategy configuration
- **Analytics**: Performance metrics and charts
- **Web3 Integration**: Wallet connection and transaction signing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/eunilo/stellar-ai-trading-automation.git
cd stellar-ai-trading-automation
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp local-config.env .env
# Edit .env with your configuration
```

4. **Start development server**
```bash
npm run dev:simple
```

5. **Access the application**
- API: http://localhost:3000
- Health Check: http://localhost:3000/health
- Metrics: http://localhost:3000/metrics

## 📚 API Documentation

### Core Endpoints

#### AI & Machine Learning
- `GET /api/ai/predictions` - Get AI predictions
- `POST /api/ai/analyze` - Analyze market with AI
- `GET /api/ai/indicators` - Get technical indicators
- `POST /api/ai/train` - Train AI models

#### Soroswap Integration
- `GET /api/soroswap/pools` - Get available pools
- `POST /api/soroswap/quote` - Get trade quotes
- `POST /api/soroswap/trade` - Execute trades
- `GET /api/soroswap/price/:pair` - Get current prices

#### Trading Strategies
- `GET /api/strategies` - List all strategies
- `POST /api/strategies` - Create new strategy
- `POST /api/strategies/:id/start` - Start strategy
- `POST /api/strategies/:id/stop` - Stop strategy

#### Market Data
- `GET /api/market/prices` - Get current prices
- `GET /api/market/trends` - Get market trends
- `GET /api/market/summary` - Get market summary

## 🎯 Trading Strategies

### 1. Grid Trading
- **Purpose**: Profit from sideways markets
- **Parameters**: Grid size, spacing, price range
- **Best for**: Stable, range-bound markets

### 2. Dollar Cost Averaging (DCA)
- **Purpose**: Reduce volatility impact
- **Parameters**: Interval, amount, max investments
- **Best for**: Long-term accumulation

### 3. Momentum Trading
- **Purpose**: Follow market trends
- **Parameters**: Lookback period, momentum threshold
- **Best for**: Trending markets

### 4. Arbitrage Trading
- **Purpose**: Exploit price differences
- **Parameters**: Min/max spread, execution delay
- **Best for**: High-frequency opportunities

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev:simple          # Start simplified development server
npm run dev                 # Start full development server

# Building
npm run build               # Build TypeScript
npm run start               # Start production server

# Testing
npm run test                # Run tests
npm run test:coverage       # Run tests with coverage

# Docker
npm run docker:dev          # Start development with Docker
npm run docker:prod         # Start production with Docker
```

### Project Structure

```
src/
├── api/                    # API routes
│   └── routes/            # Route handlers
├── services/              # Core services
├── types/                 # TypeScript definitions
├── utils/                 # Utility functions
├── config/                # Configuration
└── index.simple.ts        # Simplified entry point
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
docker-compose up -d
```

## 🔒 Security

- **Threat Modeling**: STRIDE methodology
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API protection
- **Encryption**: Sensitive data encryption
- **Authentication**: JWT-based auth system

## 📊 Monitoring

- **Health Checks**: Automated health monitoring
- **Metrics**: Prometheus integration
- **Logging**: Structured logging with Winston
- **Alerts**: Real-time error notifications

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Meridian 2025

This project was developed for **Meridian 2025**, showcasing the future of AI-powered trading on the Stellar blockchain.

---

**Built with ❤️ for the Stellar ecosystem**

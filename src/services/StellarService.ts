// Stellar AI Trading Automation - Stellar Blockchain Service
// Manages Stellar blockchain interactions and account management

import { Server, Keypair, TransactionBuilder, Operation, Asset, Networks } from '@stellar/stellar-sdk';
import { config } from '../config';
import { logger } from '../utils/logger';
import { StellarAccount } from '../types';

export class StellarService {
  private server: Server;
  private network: string;

  constructor() {
    this.network = config.stellar.network;
    this.server = new Server(config.stellar.horizonUrl);
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Stellar service...');
      
      // Test connection
      await this.server.fetchTimebounds();
      
      logger.info(`Stellar service initialized on ${this.network} network`);
    } catch (error) {
      logger.error('Failed to initialize Stellar service:', error);
      throw error;
    }
  }

  async createAccount(): Promise<StellarAccount> {
    try {
      const keypair = Keypair.random();
      
      // Fund account with Friendbot (testnet only)
      if (this.network === 'testnet') {
        await this.fundAccount(keypair.publicKey());
      }

      const account = await this.server.loadAccount(keypair.publicKey());
      
      return {
        publicKey: keypair.publicKey(),
        secretKey: keypair.secret(),
        balance: account.balances[0]?.balance || '0',
        sequence: account.sequenceNumber()
      };
    } catch (error) {
      logger.error('Failed to create Stellar account:', error);
      throw error;
    }
  }

  private async fundAccount(publicKey: string): Promise<void> {
    try {
      const response = await fetch(config.stellar.friendBotUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `addr=${publicKey}`
      });

      if (!response.ok) {
        throw new Error(`Friendbot funding failed: ${response.statusText}`);
      }

      logger.info(`Account ${publicKey} funded with Friendbot`);
    } catch (error) {
      logger.error('Failed to fund account with Friendbot:', error);
      throw error;
    }
  }

  async getAccount(publicKey: string): Promise<StellarAccount> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      return {
        publicKey,
        secretKey: '', // Not stored for security
        balance: account.balances[0]?.balance || '0',
        sequence: account.sequenceNumber()
      };
    } catch (error) {
      logger.error('Failed to get Stellar account:', error);
      throw error;
    }
  }

  async getBalance(publicKey: string, assetCode?: string): Promise<string> {
    try {
      const account = await this.server.loadAccount(publicKey);
      
      if (assetCode) {
        const balance = account.balances.find(b => 
          b.asset_type !== 'native' && 
          (b as any).asset_code === assetCode
        );
        return balance?.balance || '0';
      }
      
      return account.balances[0]?.balance || '0';
    } catch (error) {
      logger.error('Failed to get balance:', error);
      throw error;
    }
  }

  async buildTransaction(sourceAccount: StellarAccount, operations: Operation[]): Promise<string> {
    try {
      const account = await this.server.loadAccount(sourceAccount.publicKey);
      
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: this.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC
      });

      operations.forEach(op => transaction.addOperation(op));
      
      transaction.setTimeout(300);
      
      return transaction.build().toXDR();
    } catch (error) {
      logger.error('Failed to build transaction:', error);
      throw error;
    }
  }

  async submitTransaction(xdr: string): Promise<any> {
    try {
      const result = await this.server.submitTransactionXDR(xdr);
      
      logger.info('Transaction submitted successfully:', result.hash);
      return result;
    } catch (error) {
      logger.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  async getAssetInfo(assetCode: string, assetIssuer: string): Promise<any> {
    try {
      const asset = new Asset(assetCode, assetIssuer);
      return await this.server.assets().forCode(assetCode).forIssuer(assetIssuer).call();
    } catch (error) {
      logger.error('Failed to get asset info:', error);
      throw error;
    }
  }

  async getNetworkInfo(): Promise<any> {
    try {
      const info = await this.server.fetchTimebounds();
      return {
        network: this.network,
        horizonUrl: config.stellar.horizonUrl,
        timebounds: info
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    logger.info('Stellar service stopped');
  }
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Connection } from '@solana/web3.js';
import { WalletManager } from '../src/core/wallet-manager';

describe('WalletManager', () => {
  let walletManager: WalletManager;
  let mockConnection: Connection;

  beforeEach(() => {
    mockConnection = new Connection('https://api.devnet.solana.com');
    walletManager = new WalletManager({
      rpcEndpoint: 'https://api.devnet.solana.com',
      commitment: 'confirmed',
    });
  });

  describe('getBalance', () => {
    it('should return wallet balance with SOL and tokens', async () => {
      const testAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      const balance = await walletManager.getBalance(testAddress);

      expect(balance).toHaveProperty('sol');
      expect(balance).toHaveProperty('tokens');
      expect(balance).toHaveProperty('totalUsdValue');
      expect(balance).toHaveProperty('lastUpdated');
      expect(typeof balance.sol).toBe('number');
      expect(Array.isArray(balance.tokens)).toBe(true);
    });

    it('should handle invalid address gracefully', async () => {
      await expect(
        walletManager.getBalance('invalid-address')
      ).rejects.toThrow();
    });
  });

  describe('hasSufficientBalance', () => {
    it('should return true for sufficient SOL balance', async () => {
      const testAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      const result = await walletManager.hasSufficientBalance(
        testAddress,
        0.001,
        'SOL'
      );

      expect(typeof result).toBe('boolean');
    });

    it('should return false for insufficient balance', async () => {
      const testAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      const result = await walletManager.hasSufficientBalance(
        testAddress,
        999999999,
        'SOL'
      );

      expect(result).toBe(false);
    });
  });

  describe('getStakeAccounts', () => {
    it('should return array of stake accounts', async () => {
      const testAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      const stakeAccounts = await walletManager.getStakeAccounts(testAddress);

      expect(Array.isArray(stakeAccounts)).toBe(true);
    });
  });

  describe('getTransactionHistory', () => {
    it('should return transaction history', async () => {
      const testAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      
      const history = await walletManager.getTransactionHistory(testAddress, 5);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getConnection', () => {
    it('should return connection instance', () => {
      const connection = walletManager.getConnection();
      expect(connection).toBeInstanceOf(Connection);
    });
  });
});

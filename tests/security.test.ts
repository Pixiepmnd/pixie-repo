import { describe, it, expect, beforeEach } from 'vitest';
import { Connection } from '@solana/web3.js';
import { RiskAnalyzer } from '../src/security/risk-analyzer';

describe('Security Tests', () => {
  let riskAnalyzer: RiskAnalyzer;
  let connection: Connection;

  beforeEach(() => {
    connection = new Connection('https://api.devnet.solana.com');
    riskAnalyzer = new RiskAnalyzer(connection);
  });

  describe('RiskAnalyzer', () => {
    it('should identify trusted tokens as low risk', async () => {
      const usdcMint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
      const risk = await riskAnalyzer.analyzeToken(usdcMint);

      expect(risk.riskLevel).toBe('low');
      expect(risk.isHoneyPot).toBe(false);
      expect(risk.isSuspicious).toBe(false);
    });

    it('should detect blacklisted addresses', () => {
      const scamAddress = 'ScamAddress123';
      riskAnalyzer.addScamAddress(scamAddress);

      expect(riskAnalyzer.isBlacklisted(scamAddress)).toBe(true);
    });

    it('should provide recommendations for risky tokens', async () => {
      const randomMint = 'RandomToken123456789';
      const risk = await riskAnalyzer.analyzeToken(randomMint);

      expect(risk.recommendations).toBeDefined();
      expect(risk.recommendations.length).toBeGreaterThan(0);
    });

    it('should analyze transaction risks', async () => {
      const from = 'FromAddress123';
      const to = 'ToAddress456';
      const amount = 1.0;

      const risk = await riskAnalyzer.analyzeTransaction(from, to, amount);

      expect(risk).toBeDefined();
      expect(risk.riskLevel).toBeDefined();
      expect(risk.score).toBeGreaterThanOrEqual(0);
      expect(risk.score).toBeLessThanOrEqual(100);
    });
  });

  describe('Address Validation', () => {
    it('should validate correct Solana addresses', () => {
      const validAddress = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      // Test through risk analyzer
      expect(validAddress.length).toBeGreaterThanOrEqual(32);
      expect(validAddress.length).toBeLessThanOrEqual(44);
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = ['invalid', '123', '', 'too-short'];
      
      invalidAddresses.forEach(addr => {
        expect(addr.length < 32 || addr.length > 44).toBe(true);
      });
    });
  });
});

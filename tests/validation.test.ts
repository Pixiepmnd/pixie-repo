import { describe, it, expect } from 'vitest';
import {
  isValidSolanaAddress,
  isValidAmount,
  isValidTokenSymbol,
  isValidPrivateKey,
  isValidSignature,
  isValidEmail,
  isValidUrl,
  sanitizeInput,
} from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidSolanaAddress', () => {
    it('should validate correct Solana addresses', () => {
      const validAddresses = [
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ];

      validAddresses.forEach(address => {
        expect(isValidSolanaAddress(address)).toBe(true);
      });
    });

    it('should reject invalid addresses', () => {
      const invalidAddresses = [
        'invalid',
        '123',
        '',
        'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK0', // too long
      ];

      invalidAddresses.forEach(address => {
        expect(isValidSolanaAddress(address)).toBe(false);
      });
    });
  });

  describe('isValidAmount', () => {
    it('should validate positive numbers', () => {
      expect(isValidAmount(1)).toBe(true);
      expect(isValidAmount(0.5)).toBe(true);
      expect(isValidAmount(1000.123)).toBe(true);
    });

    it('should reject invalid amounts', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
    });
  });

  describe('isValidTokenSymbol', () => {
    it('should validate known token symbols', () => {
      const validTokens = ['SOL', 'USDC', 'USDT', 'BONK', 'JUP'];
      
      validTokens.forEach(token => {
        expect(isValidTokenSymbol(token)).toBe(true);
      });
    });

    it('should handle case insensitivity', () => {
      expect(isValidTokenSymbol('sol')).toBe(true);
      expect(isValidTokenSymbol('SoL')).toBe(true);
    });

    it('should reject unknown tokens', () => {
      expect(isValidTokenSymbol('UNKNOWN')).toBe(false);
      expect(isValidTokenSymbol('XYZ')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.com',
      ];

      validEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
      ];

      invalidEmails.forEach(email => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidUrl', () => {
    it('should validate correct URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://localhost:3000',
        'https://api.example.com/path',
      ];

      validUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not a url',
        'example.com',
        'ftp://invalid',
      ];

      invalidUrls.forEach(url => {
        expect(isValidUrl(url)).toBe(false);
      });
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle normal input', () => {
      expect(sanitizeInput('send 5 SOL')).toBe('send 5 SOL');
    });
  });
});

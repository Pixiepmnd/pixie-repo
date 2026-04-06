import { describe, it, expect, beforeEach } from 'vitest';
import { NLPParser } from '../src/core/nlp-parser';
import { IntentAction } from '../src/types/nlp';

describe('NLPParser', () => {
  let parser: NLPParser;

  beforeEach(() => {
    parser = new NLPParser();
  });

  describe('parseIntent', () => {
    it('should parse send token intent', async () => {
      const result = await parser.parseIntent('send 5 SOL to ABC123');
      
      expect(result.action).toBe(IntentAction.SEND_TOKEN);
      expect(result.entities.amount).toBe(5);
      expect(result.entities.token).toBe('SOL');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should parse swap intent', async () => {
      const result = await parser.parseIntent('swap 10 SOL for USDC');
      
      expect(result.action).toBe(IntentAction.SWAP_TOKEN);
      expect(result.entities.amount).toBe(10);
      expect(result.entities.sourceToken).toBe('SOL');
      expect(result.entities.targetToken).toBe('USDC');
    });

    it('should parse balance check intent', async () => {
      const result = await parser.parseIntent('what is my balance?');
      
      expect(result.action).toBe(IntentAction.CHECK_BALANCE);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should parse stake intent', async () => {
      const result = await parser.parseIntent('stake 5 SOL');
      
      expect(result.action).toBe(IntentAction.STAKE_SOL);
      expect(result.entities.amount).toBe(5);
    });

    it('should parse price query intent', async () => {
      const result = await parser.parseIntent('what is the price of SOL?');
      
      expect(result.action).toBe(IntentAction.GET_PRICE);
      expect(result.entities.token).toBe('SOL');
    });

    it('should handle chat intent', async () => {
      const result = await parser.parseIntent('hello, how are you?');
      
      expect(result.action).toBe(IntentAction.CHAT);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should extract multiple entities', async () => {
      const result = await parser.parseIntent('send 2.5 USDC to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');
      
      expect(result.entities.amount).toBe(2.5);
      expect(result.entities.token).toBe('USDC');
      expect(result.entities.recipient).toBeDefined();
    });

    it('should handle unknown intent', async () => {
      const result = await parser.parseIntent('xyzabc random text');
      
      expect(result.action).toBe(IntentAction.UNKNOWN);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('entity extraction', () => {
    it('should extract decimal amounts', async () => {
      const result = await parser.parseIntent('send 0.5 SOL');
      expect(result.entities.amount).toBe(0.5);
    });

    it('should extract token symbols', async () => {
      const tokens = ['SOL', 'USDC', 'USDT', 'BONK'];
      
      for (const token of tokens) {
        const result = await parser.parseIntent(`send 1 ${token}`);
        expect(result.entities.token).toBe(token);
      }
    });

    it('should extract Solana addresses', async () => {
      const address = 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK';
      const result = await parser.parseIntent(`send 1 SOL to ${address}`);
      
      expect(result.entities.recipient).toBe(address);
    });
  });

  describe('confidence calculation', () => {
    it('should have high confidence for complete intents', async () => {
      const result = await parser.parseIntent('send 5 SOL to ABC123');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should have lower confidence for incomplete intents', async () => {
      const result = await parser.parseIntent('send something');
      expect(result.confidence).toBeLessThan(0.7);
    });

    it('should have high confidence for chat', async () => {
      const result = await parser.parseIntent('hello');
      expect(result.confidence).toBeGreaterThan(0.8);
    });
  });
});

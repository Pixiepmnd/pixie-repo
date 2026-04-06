import { describe, it, expect, beforeAll } from 'vitest';
import { Keypair, Connection } from '@solana/web3.js';
import { PixieClient } from '../src/client';

describe('Integration Tests', () => {
  let pixie: PixieClient;
  let connection: Connection;

  beforeAll(() => {
    // Use devnet for testing
    const wallet = Keypair.generate();
    connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    pixie = new PixieClient({
      rpcEndpoint: 'https://api.devnet.solana.com',
      wallet,
    });
  });

  describe('Chat Interface', () => {
    it('should handle greeting', async () => {
      const response = await pixie.chat('hello');
      expect(response).toContain('Pixie');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle help request', async () => {
      const response = await pixie.chat('help');
      expect(response).toContain('command');
    });

    it('should handle balance check', async () => {
      const response = await pixie.chat('what is my balance?');
      expect(response).toContain('balance');
    });

    it('should handle price query', async () => {
      const response = await pixie.chat('what is the price of SOL?');
      expect(response).toContain('price');
    });
  });

  describe('Intent Parsing', () => {
    it('should parse send intent', async () => {
      const response = await pixie.chat('send 0.1 SOL to test');
      expect(response).toBeDefined();
    });

    it('should parse swap intent', async () => {
      const response = await pixie.chat('swap 1 SOL for USDC');
      expect(response).toBeDefined();
    });

    it('should parse stake intent', async () => {
      const response = await pixie.chat('stake 5 SOL');
      expect(response).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid commands gracefully', async () => {
      const response = await pixie.chat('xyzabc invalid command');
      expect(response).toBeDefined();
      expect(response.length).toBeGreaterThan(0);
    });

    it('should handle missing parameters', async () => {
      const response = await pixie.chat('send SOL');
      expect(response).toContain('specify');
    });
  });

  describe('Conversation Context', () => {
    it('should maintain conversation history', async () => {
      await pixie.chat('hello');
      await pixie.chat('what is my balance?');
      
      const history = pixie.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should limit history size', async () => {
      // Send many messages
      for (let i = 0; i < 25; i++) {
        await pixie.chat('test message');
      }

      const history = pixie.getHistory();
      expect(history.length).toBeLessThanOrEqual(20);
    });
  });
});

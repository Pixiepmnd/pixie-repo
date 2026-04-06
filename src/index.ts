/**
 * Pixie - AI-Powered Solana Wallet Chatbot
 * Main entry point
 */

export { PixieClient, PixieConfig } from './client';
export { NLPParser } from './core/nlp-parser';
export { TransactionBuilder } from './core/transaction-builder';
export { WalletManager } from './core/wallet-manager';

export * from './types/nlp';
export * from './types/wallet';
export * from './utils/validation';
export * from './utils/formatting';

// Version
export const VERSION = '0.1.0';

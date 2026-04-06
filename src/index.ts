/**
 * Pixie - AI-Powered Solana Wallet Chatbot
 * Main entry point and exports
 */

// Main client
export { PixieClient, PixieConfig } from './client';

// Core components
export { NLPParser } from './core/nlp-parser';
export { TransactionBuilder } from './core/transaction-builder';
export { WalletManager } from './core/wallet-manager';
export { RateLimiter } from './core/rate-limiter';

// Integrations
export { JupiterIntegration } from './integrations/jupiter';
export { JitoIntegration } from './integrations/jito';

// Security
export { RiskAnalyzer } from './security/risk-analyzer';

// Types
export * from './types/nlp';
export * from './types/wallet';
export * from './types/errors';

// Utilities
export * from './utils/validation';
export * from './utils/formatting';
export * from './utils/cache';
export * from './utils/logger';
export * from './utils/retry';
export * from './utils/constants';
export * from './utils/metrics';

// Version
export const VERSION = '0.1.0';

// Default export
export default PixieClient;

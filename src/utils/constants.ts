/**
 * Constants used throughout Pixie
 */

// Token Mints
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  JTO: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
  PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  WEN: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk',
} as const;

// RPC Endpoints
export const RPC_ENDPOINTS = {
  MAINNET: 'https://api.mainnet-beta.solana.com',
  DEVNET: 'https://api.devnet.solana.com',
  TESTNET: 'https://api.testnet.solana.com',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  JUPITER: 'https://quote-api.jup.ag/v6',
  JITO: 'https://mainnet.block-engine.jito.wtf',
} as const;

// Transaction Limits
export const TRANSACTION_LIMITS = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 30000,
  CONFIRMATION_TIMEOUT_MS: 60000,
} as const;

// Rate Limits
export const RATE_LIMITS = {
  RPC_REQUESTS_PER_SECOND: 10,
  JUPITER_REQUESTS_PER_MINUTE: 60,
  MAX_CONCURRENT_TRANSACTIONS: 5,
} as const;

// Cache TTLs (milliseconds)
export const CACHE_TTL = {
  TOKEN_METADATA: 3600000, // 1 hour
  PRICE_DATA: 60000, // 1 minute
  BALANCE: 30000, // 30 seconds
  TRANSACTION_STATUS: 5000, // 5 seconds
} as const;

// Slippage Settings (basis points)
export const SLIPPAGE = {
  LOW: 25, // 0.25%
  MEDIUM: 50, // 0.5%
  HIGH: 100, // 1%
  MAX: 500, // 5%
} as const;

// Fee Settings (SOL)
export const FEES = {
  BASE_TRANSACTION: 0.000005,
  SWAP_TRANSACTION: 0.00001,
  STAKE_TRANSACTION: 0.000007,
  JITO_TIP_LOW: 0.00001,
  JITO_TIP_MEDIUM: 0.0001,
  JITO_TIP_HIGH: 0.001,
} as const;

// Risk Thresholds
export const RISK_THRESHOLDS = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 90,
} as const;

// Validation Limits
export const VALIDATION = {
  MIN_SOL_AMOUNT: 0.000001,
  MAX_SOL_AMOUNT: 1000000,
  MIN_TOKEN_AMOUNT: 0.000001,
  ADDRESS_LENGTH_MIN: 32,
  ADDRESS_LENGTH_MAX: 44,
} as const;

// NLP Settings
export const NLP = {
  MAX_CONTEXT_MESSAGES: 20,
  MIN_CONFIDENCE: 0.5,
  DEFAULT_TEMPERATURE: 0.3,
  MAX_TOKENS: 500,
} as const;

// Version
export const VERSION = '0.1.0';

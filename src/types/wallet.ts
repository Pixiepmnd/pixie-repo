/**
 * Core wallet type definitions for Pixie
 */

import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

export interface WalletConfig {
  rpcEndpoint: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  maxRetries?: number;
  timeout?: number;
}

export interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  totalUsdValue: number;
  lastUpdated: Date;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  usdValue: number;
  logoUri?: string;
}

export interface TransactionIntent {
  type: TransactionType;
  from: PublicKey;
  to?: PublicKey;
  amount?: number;
  token?: string;
  metadata?: Record<string, unknown>;
}

export enum TransactionType {
  SEND = 'send',
  SWAP = 'swap',
  STAKE = 'stake',
  UNSTAKE = 'unstake',
  PURCHASE = 'purchase',
  BALANCE = 'balance',
}

export interface TransactionResult {
  signature: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  fee: number;
  error?: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  priceImpact: number;
  route: SwapRoute[];
  estimatedFee: number;
}

export interface SwapRoute {
  ammKey: string;
  label: string;
  inputMint: string;
  outputMint: string;
  inAmount: number;
  outAmount: number;
  feeAmount: number;
  feeMint: string;
}

export interface StakeAccount {
  address: string;
  validator: string;
  amount: number;
  activationEpoch: number;
  deactivationEpoch?: number;
  rewards: number;
  status: 'active' | 'inactive' | 'activating' | 'deactivating';
}

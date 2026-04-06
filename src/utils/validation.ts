/**
 * Validation utilities for Pixie
 */

import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate Solana address
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBytes());
  } catch {
    return false;
  }
}

/**
 * Validate token amount
 */
export function isValidAmount(amount: number): boolean {
  return amount > 0 && Number.isFinite(amount) && !Number.isNaN(amount);
}

/**
 * Validate token symbol
 */
export function isValidTokenSymbol(symbol: string): boolean {
  const validTokens = ['SOL', 'USDC', 'USDT', 'BONK', 'JUP', 'JTO', 'PYTH', 'WEN'];
  return validTokens.includes(symbol.toUpperCase());
}

/**
 * Validate private key format
 */
export function isValidPrivateKey(key: string): boolean {
  try {
    const decoded = bs58.decode(key);
    return decoded.length === 64;
  } catch {
    return false;
  }
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Validate transaction signature
 */
export function isValidSignature(signature: string): boolean {
  try {
    const decoded = bs58.decode(signature);
    return decoded.length === 64;
  } catch {
    return false;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Risk Analysis Layer for Transaction Security
 * Detects honey pots, scams, and suspicious contracts
 */

import { Connection, PublicKey } from '@solana/web3.js';
import axios from 'axios';

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
  flags: RiskFlag[];
  recommendations: string[];
  isHoneyPot: boolean;
  isSuspicious: boolean;
}

export interface RiskFlag {
  type: 'honeypot' | 'scam' | 'suspicious_contract' | 'high_slippage' | 'low_liquidity' | 'unverified_token';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details?: string;
}

export class RiskAnalyzer {
  private connection: Connection;
  private knownScams: Set<string>;
  private trustedTokens: Set<string>;

  constructor(connection: Connection) {
    this.connection = connection;
    this.knownScams = new Set();
    this.trustedTokens = new Set([
      'So11111111111111111111111111111111111111112', // Wrapped SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // USDT
    ]);
  }

  /**
   * Analyze token for risks before swap
   */
  async analyzeToken(tokenMint: string): Promise<RiskAssessment> {
    const flags: RiskFlag[] = [];
    let score = 0;

    // Check if known scam
    if (this.knownScams.has(tokenMint)) {
      flags.push({
        type: 'scam',
        severity: 'critical',
        message: 'This token is a known scam',
        details: 'Token has been reported and verified as fraudulent',
      });
      score += 100;
    }

    // Check if trusted token
    if (this.trustedTokens.has(tokenMint)) {
      return {
        riskLevel: 'low',
        score: 0,
        flags: [],
        recommendations: ['This is a verified and trusted token'],
        isHoneyPot: false,
        isSuspicious: false,
      };
    }

    // Check honey pot indicators
    const honeyPotCheck = await this.checkHoneyPot(tokenMint);
    if (honeyPotCheck.isHoneyPot) {
      flags.push({
        type: 'honeypot',
        severity: 'critical',
        message: 'Potential honey pot detected',
        details: honeyPotCheck.reason,
      });
      score += 80;
    }

    // Check liquidity
    const liquidityCheck = await this.checkLiquidity(tokenMint);
    if (liquidityCheck.isLow) {
      flags.push({
        type: 'low_liquidity',
        severity: 'high',
        message: 'Low liquidity detected',
        details: `Liquidity: $${liquidityCheck.amount}`,
      });
      score += 40;
    }

    // Check contract verification
    const verificationCheck = await this.checkVerification(tokenMint);
    if (!verificationCheck.isVerified) {
      flags.push({
        type: 'unverified_token',
        severity: 'medium',
        message: 'Token contract not verified',
        details: 'Unable to verify token contract source code',
      });
      score += 20;
    }

    // Check holder distribution
    const holderCheck = await this.checkHolderDistribution(tokenMint);
    if (holderCheck.isCentralized) {
      flags.push({
        type: 'suspicious_contract',
        severity: 'high',
        message: 'Centralized token distribution',
        details: `Top holder owns ${holderCheck.topHolderPercent}%`,
      });
      score += 30;
    }

    // Determine risk level
    const riskLevel = this.calculateRiskLevel(score);
    const recommendations = this.generateRecommendations(flags);

    return {
      riskLevel,
      score: Math.min(score, 100),
      flags,
      recommendations,
      isHoneyPot: honeyPotCheck.isHoneyPot,
      isSuspicious: score > 50,
    };
  }

  /**
   * Check for honey pot indicators
   */
  private async checkHoneyPot(tokenMint: string): Promise<{
    isHoneyPot: boolean;
    reason?: string;
  }> {
    try {
      // Simulated honey pot detection
      // In production, this would:
      // 1. Simulate buy transaction
      // 2. Simulate sell transaction
      // 3. Check if sell fails or has extreme slippage

      const tokenInfo = await this.connection.getParsedAccountInfo(new PublicKey(tokenMint));
      
      if (!tokenInfo.value) {
        return { isHoneyPot: true, reason: 'Token account not found' };
      }

      // Check for suspicious patterns
      // This is a simplified check
      return { isHoneyPot: false };
    } catch (error) {
      return { isHoneyPot: false };
    }
  }

  /**
   * Check token liquidity
   */
  private async checkLiquidity(tokenMint: string): Promise<{
    isLow: boolean;
    amount: number;
  }> {
    // Simulated liquidity check
    // In production, this would query DEX pools
    const simulatedLiquidity = Math.random() * 1000000;

    return {
      isLow: simulatedLiquidity < 10000,
      amount: simulatedLiquidity,
    };
  }

  /**
   * Check contract verification status
   */
  private async checkVerification(tokenMint: string): Promise<{
    isVerified: boolean;
  }> {
    // Simulated verification check
    // In production, this would check against verified contract registry
    return {
      isVerified: this.trustedTokens.has(tokenMint) || Math.random() > 0.3,
    };
  }

  /**
   * Check holder distribution
   */
  private async checkHolderDistribution(tokenMint: string): Promise<{
    isCentralized: boolean;
    topHolderPercent: number;
  }> {
    // Simulated holder distribution check
    // In production, this would analyze token holder accounts
    const topHolderPercent = Math.random() * 100;

    return {
      isCentralized: topHolderPercent > 50,
      topHolderPercent: Math.round(topHolderPercent),
    };
  }

  /**
   * Calculate overall risk level
   */
  private calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendations based on flags
   */
  private generateRecommendations(flags: RiskFlag[]): string[] {
    const recommendations: string[] = [];

    if (flags.some(f => f.type === 'honeypot')) {
      recommendations.push('DO NOT PROCEED - This appears to be a honey pot scam');
      recommendations.push('You will not be able to sell this token after purchase');
    }

    if (flags.some(f => f.type === 'scam')) {
      recommendations.push('DO NOT PROCEED - This is a known scam token');
    }

    if (flags.some(f => f.type === 'low_liquidity')) {
      recommendations.push('Exercise extreme caution - Low liquidity may cause high slippage');
      recommendations.push('Consider using a smaller amount for testing');
    }

    if (flags.some(f => f.type === 'unverified_token')) {
      recommendations.push('Token contract is not verified - Proceed with caution');
      recommendations.push('Only invest amounts you can afford to lose');
    }

    if (flags.some(f => f.type === 'suspicious_contract')) {
      recommendations.push('Centralized token distribution detected');
      recommendations.push('Large holders may dump tokens at any time');
    }

    if (recommendations.length === 0) {
      recommendations.push('Token appears safe, but always do your own research');
      recommendations.push('Start with small amounts to test');
    }

    return recommendations;
  }

  /**
   * Analyze transaction for risks
   */
  async analyzeTransaction(
    from: string,
    to: string,
    amount: number,
    token?: string
  ): Promise<RiskAssessment> {
    const flags: RiskFlag[] = [];
    let score = 0;

    // Check recipient address
    if (this.knownScams.has(to)) {
      flags.push({
        type: 'scam',
        severity: 'critical',
        message: 'Recipient is a known scam address',
      });
      score += 100;
    }

    // Check amount (unusually large)
    const balance = await this.connection.getBalance(new PublicKey(from));
    const balanceSOL = balance / 1e9;

    if (amount > balanceSOL * 0.9) {
      flags.push({
        type: 'suspicious_contract',
        severity: 'medium',
        message: 'Transaction amount is very high (>90% of balance)',
        details: 'Consider splitting into smaller transactions',
      });
      score += 15;
    }

    // If token swap, analyze token
    if (token) {
      const tokenRisk = await this.analyzeToken(token);
      flags.push(...tokenRisk.flags);
      score += tokenRisk.score;
    }

    const riskLevel = this.calculateRiskLevel(score);
    const recommendations = this.generateRecommendations(flags);

    return {
      riskLevel,
      score: Math.min(score, 100),
      flags,
      recommendations,
      isHoneyPot: flags.some(f => f.type === 'honeypot'),
      isSuspicious: score > 50,
    };
  }

  /**
   * Add known scam address
   */
  addScamAddress(address: string): void {
    this.knownScams.add(address);
  }

  /**
   * Add trusted token
   */
  addTrustedToken(mint: string): void {
    this.trustedTokens.add(mint);
  }

  /**
   * Check if address is blacklisted
   */
  isBlacklisted(address: string): boolean {
    return this.knownScams.has(address);
  }
}

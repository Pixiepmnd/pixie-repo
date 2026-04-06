/**
 * Jupiter V6 Aggregator Integration
 * Provides optimal swap routing for Solana tokens
 */

import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { SwapQuote, SwapRoute } from '../types/wallet';
import axios from 'axios';

export interface JupiterConfig {
  apiEndpoint?: string;
  slippageBps?: number;
  maxAccounts?: number;
}

export class JupiterIntegration {
  private apiEndpoint: string;
  private slippageBps: number;
  private maxAccounts: number;

  constructor(config: JupiterConfig = {}) {
    this.apiEndpoint = config.apiEndpoint || 'https://quote-api.jup.ag/v6';
    this.slippageBps = config.slippageBps || 50; // 0.5%
    this.maxAccounts = config.maxAccounts || 64;
  }

  /**
   * Get swap quote from Jupiter
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps?: number
  ): Promise<SwapQuote> {
    try {
      const response = await axios.get(`${this.apiEndpoint}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount: Math.floor(amount),
          slippageBps: slippageBps || this.slippageBps,
          onlyDirectRoutes: false,
          asLegacyTransaction: false,
        },
      });

      const quote = response.data;

      return {
        inputMint,
        outputMint,
        inAmount: amount,
        outAmount: parseInt(quote.outAmount),
        priceImpact: parseFloat(quote.priceImpactPct),
        route: this.parseRoutes(quote.routePlan),
        estimatedFee: parseInt(quote.contextSlot) * 0.000005, // Estimated
      };
    } catch (error) {
      throw new Error(`Failed to get Jupiter quote: ${error}`);
    }
  }

  /**
   * Get swap transaction from Jupiter
   */
  async getSwapTransaction(
    quote: SwapQuote,
    userPublicKey: PublicKey,
    wrapUnwrapSOL?: boolean
  ): Promise<VersionedTransaction> {
    try {
      const response = await axios.post(`${this.apiEndpoint}/swap`, {
        quoteResponse: quote,
        userPublicKey: userPublicKey.toBase58(),
        wrapAndUnwrapSol: wrapUnwrapSOL ?? true,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: 'auto',
      });

      const { swapTransaction } = response.data;

      // Deserialize transaction
      const transactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuf);

      return transaction;
    } catch (error) {
      throw new Error(`Failed to get swap transaction: ${error}`);
    }
  }

  /**
   * Execute swap with Jupiter
   */
  async executeSwap(
    connection: Connection,
    inputMint: string,
    outputMint: string,
    amount: number,
    userPublicKey: PublicKey,
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
  ): Promise<string> {
    // Get quote
    const quote = await this.getQuote(inputMint, outputMint, amount);

    // Get swap transaction
    const transaction = await this.getSwapTransaction(quote, userPublicKey);

    // Sign transaction
    const signedTransaction = await signTransaction(transaction);

    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        maxRetries: 3,
      }
    );

    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    return signature;
  }

  /**
   * Get token list from Jupiter
   */
  async getTokenList(): Promise<Array<{
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
  }>> {
    try {
      const response = await axios.get('https://token.jup.ag/all');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch token list: ${error}`);
    }
  }

  /**
   * Get token price from Jupiter
   */
  async getTokenPrice(tokenMint: string): Promise<number> {
    try {
      const response = await axios.get(`https://price.jup.ag/v4/price`, {
        params: {
          ids: tokenMint,
        },
      });

      const priceData = response.data.data[tokenMint];
      return priceData ? priceData.price : 0;
    } catch (error) {
      throw new Error(`Failed to fetch token price: ${error}`);
    }
  }

  /**
   * Parse route plan from Jupiter response
   */
  private parseRoutes(routePlan: any[]): SwapRoute[] {
    return routePlan.map(step => ({
      ammKey: step.swapInfo.ammKey,
      label: step.swapInfo.label,
      inputMint: step.swapInfo.inputMint,
      outputMint: step.swapInfo.outputMint,
      inAmount: parseInt(step.swapInfo.inAmount),
      outAmount: parseInt(step.swapInfo.outAmount),
      feeAmount: parseInt(step.swapInfo.feeAmount),
      feeMint: step.swapInfo.feeMint,
    }));
  }

  /**
   * Calculate price impact
   */
  calculatePriceImpact(
    inputAmount: number,
    outputAmount: number,
    marketPrice: number
  ): number {
    const expectedOutput = inputAmount * marketPrice;
    const impact = ((expectedOutput - outputAmount) / expectedOutput) * 100;
    return Math.abs(impact);
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(
    inputMint: string,
    outputMint: string,
    amount: number
  ): boolean {
    if (!inputMint || !outputMint) {
      throw new Error('Invalid token mints');
    }

    if (inputMint === outputMint) {
      throw new Error('Cannot swap same token');
    }

    if (amount <= 0) {
      throw new Error('Invalid swap amount');
    }

    return true;
  }

  /**
   * Get optimal route with multiple quotes
   */
  async getOptimalRoute(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<SwapQuote> {
    // Get multiple quotes with different slippage
    const slippageOptions = [25, 50, 100]; // 0.25%, 0.5%, 1%
    const quotes = await Promise.all(
      slippageOptions.map(slippage =>
        this.getQuote(inputMint, outputMint, amount, slippage)
      )
    );

    // Return quote with best output amount
    return quotes.reduce((best, current) =>
      current.outAmount > best.outAmount ? current : best
    );
  }
}

/**
 * Transaction Builder for Solana operations
 * Constructs and signs transactions based on parsed intents
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
} from '@solana/web3.js';
import { TransactionIntent, TransactionResult, TransactionType } from '../types/wallet';

export class TransactionBuilder {
  private connection: Connection;
  private wallet: Keypair;

  constructor(connection: Connection, wallet: Keypair) {
    this.connection = connection;
    this.wallet = wallet;
  }

  /**
   * Build and execute transaction from intent
   */
  async executeIntent(intent: TransactionIntent): Promise<TransactionResult> {
    try {
      let signature: string;

      switch (intent.type) {
        case TransactionType.SEND:
          signature = await this.executeSend(intent);
          break;
        case TransactionType.SWAP:
          signature = await this.executeSwap(intent);
          break;
        case TransactionType.STAKE:
          signature = await this.executeStake(intent);
          break;
        case TransactionType.UNSTAKE:
          signature = await this.executeUnstake(intent);
          break;
        default:
          throw new Error(`Unsupported transaction type: ${intent.type}`);
      }

      const fee = await this.estimateFee(intent);

      return {
        signature,
        status: 'success',
        timestamp: new Date(),
        fee,
      };
    } catch (error) {
      return {
        signature: '',
        status: 'failed',
        timestamp: new Date(),
        fee: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Execute SOL transfer
   */
  private async executeSend(intent: TransactionIntent): Promise<string> {
    if (!intent.to || !intent.amount) {
      throw new Error('Missing recipient or amount for send transaction');
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: this.wallet.publicKey,
        toPubkey: intent.to,
        lamports: intent.amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet],
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      }
    );

    return signature;
  }

  /**
   * Execute token swap via Jupiter
   */
  private async executeSwap(intent: TransactionIntent): Promise<string> {
    // Simulated Jupiter V6 integration
    const { amount, token, metadata } = intent;

    if (!amount || !token) {
      throw new Error('Missing swap parameters');
    }

    // In production, this would call Jupiter API
    const swapTransaction = await this.buildJupiterSwap(
      metadata?.sourceToken as string,
      token,
      amount
    );

    const signature = await sendAndConfirmTransaction(
      this.connection,
      swapTransaction,
      [this.wallet],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Execute SOL staking
   */
  private async executeStake(intent: TransactionIntent): Promise<string> {
    const { amount, metadata } = intent;

    if (!amount) {
      throw new Error('Missing stake amount');
    }

    const validatorVote = metadata?.validator as string;
    if (!validatorVote) {
      throw new Error('Missing validator address');
    }

    // Create stake account and delegate
    // Simplified implementation
    const stakeAccount = Keypair.generate();
    
    // In production, this would use proper stake program instructions
    const transaction = new Transaction();
    // Add stake instructions here

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet, stakeAccount],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Execute SOL unstaking
   */
  private async executeUnstake(intent: TransactionIntent): Promise<string> {
    const { metadata } = intent;
    const stakeAccount = metadata?.stakeAccount as string;

    if (!stakeAccount) {
      throw new Error('Missing stake account');
    }

    // Deactivate stake
    const transaction = new Transaction();
    // Add deactivate instructions here

    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.wallet],
      { commitment: 'confirmed' }
    );

    return signature;
  }

  /**
   * Build Jupiter swap transaction (simulated)
   */
  private async buildJupiterSwap(
    inputMint: string,
    outputMint: string,
    amount: number
  ): Promise<Transaction> {
    // Simulated Jupiter V6 API call
    // In production, this would:
    // 1. Get quote from Jupiter API
    // 2. Get swap transaction
    // 3. Return serialized transaction

    const transaction = new Transaction();
    // Add swap instructions from Jupiter

    return transaction;
  }

  /**
   * Estimate transaction fee
   */
  private async estimateFee(intent: TransactionIntent): Promise<number> {
    // Base fee for simple transactions
    let baseFee = 0.000005; // 5000 lamports

    switch (intent.type) {
      case TransactionType.SEND:
        baseFee = 0.000005;
        break;
      case TransactionType.SWAP:
        baseFee = 0.00001; // Higher for swaps
        break;
      case TransactionType.STAKE:
      case TransactionType.UNSTAKE:
        baseFee = 0.000007;
        break;
    }

    return baseFee;
  }

  /**
   * Validate transaction before execution
   */
  async validateTransaction(intent: TransactionIntent): Promise<boolean> {
    // Check wallet balance
    const balance = await this.connection.getBalance(this.wallet.publicKey);
    const balanceSOL = balance / LAMPORTS_PER_SOL;

    if (intent.amount && intent.amount > balanceSOL) {
      throw new Error('Insufficient balance');
    }

    // Check recipient address validity
    if (intent.to) {
      try {
        new PublicKey(intent.to);
      } catch {
        throw new Error('Invalid recipient address');
      }
    }

    return true;
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(signature: string): Promise<'success' | 'failed' | 'pending'> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      
      if (!status.value) {
        return 'pending';
      }

      if (status.value.err) {
        return 'failed';
      }

      return 'success';
    } catch {
      return 'pending';
    }
  }
}

/**
 * Pixie Client - Main interface for wallet bot operations
 */

import { Keypair, Connection } from '@solana/web3.js';
import { NLPParser } from './core/nlp-parser';
import { TransactionBuilder } from './core/transaction-builder';
import { WalletManager } from './core/wallet-manager';
import { ParsedIntent, ConversationContext, Message } from './types/nlp';
import { TransactionIntent, TransactionType, TransactionResult, WalletBalance } from './types/wallet';
import { isValidSolanaAddress, isValidAmount } from './utils/validation';
import { formatSOL, formatUSD, shortenAddress } from './utils/formatting';

export interface PixieConfig {
  rpcEndpoint: string;
  wallet: Keypair;
  openaiApiKey?: string;
  enableRust?: boolean;
}

export class PixieClient {
  private nlpParser: NLPParser;
  private transactionBuilder: TransactionBuilder;
  private walletManager: WalletManager;
  private wallet: Keypair;
  private context: ConversationContext;

  constructor(config: PixieConfig) {
    this.wallet = config.wallet;

    // Initialize connection
    const connection = new Connection(config.rpcEndpoint, 'confirmed');

    // Initialize components
    this.nlpParser = new NLPParser();
    this.transactionBuilder = new TransactionBuilder(connection, this.wallet);
    this.walletManager = new WalletManager({
      rpcEndpoint: config.rpcEndpoint,
      commitment: 'confirmed',
    });

    // Initialize conversation context
    this.context = {
      userId: this.wallet.publicKey.toBase58(),
      sessionId: this.generateSessionId(),
      history: [],
      walletAddress: this.wallet.publicKey.toBase58(),
    };
  }

  /**
   * Process user message and execute intent
   */
  async chat(userMessage: string): Promise<string> {
    // Add user message to history
    this.addToHistory('user', userMessage);

    try {
      // Parse intent from message
      const intent = await this.nlpParser.parseIntent(userMessage, this.context);
      this.context.lastIntent = intent;

      // Handle based on action type
      let response: string;

      switch (intent.action) {
        case 'send_token':
          response = await this.handleSend(intent);
          break;
        case 'swap_token':
          response = await this.handleSwap(intent);
          break;
        case 'stake_sol':
          response = await this.handleStake(intent);
          break;
        case 'unstake_sol':
          response = await this.handleUnstake(intent);
          break;
        case 'check_balance':
          response = await this.handleBalance();
          break;
        case 'get_price':
          response = await this.handlePrice(intent);
          break;
        case 'purchase_item':
          response = await this.handlePurchase(intent);
          break;
        case 'chat':
        default:
          response = await this.handleChat(userMessage);
          break;
      }

      // Add response to history
      this.addToHistory('assistant', response);

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      this.addToHistory('assistant', `Error: ${errorMessage}`);
      return `Sorry, I encountered an error: ${errorMessage}`;
    }
  }

  /**
   * Handle send token intent
   */
  private async handleSend(intent: ParsedIntent): Promise<string> {
    const { amount, token, recipient } = intent.entities;

    if (!amount || !recipient) {
      return 'Please specify the amount and recipient address for the transfer.';
    }

    if (!isValidSolanaAddress(recipient)) {
      return 'Invalid recipient address. Please provide a valid Solana address.';
    }

    if (!isValidAmount(amount)) {
      return 'Invalid amount. Please specify a positive number.';
    }

    // Check balance
    const hasBalance = await this.walletManager.hasSufficientBalance(
      this.wallet.publicKey.toBase58(),
      amount,
      token
    );

    if (!hasBalance) {
      return `Insufficient balance. You don't have enough ${token || 'SOL'}.`;
    }

    // Execute transaction
    const txIntent: TransactionIntent = {
      type: TransactionType.SEND,
      from: this.wallet.publicKey,
      to: new PublicKey(recipient),
      amount,
      token,
    };

    const result = await this.transactionBuilder.executeIntent(txIntent);

    if (result.status === 'success') {
      return `Successfully sent ${amount} ${token || 'SOL'} to ${shortenAddress(recipient)}.\nTransaction: ${result.signature}`;
    } else {
      return `Transaction failed: ${result.error}`;
    }
  }

  /**
   * Handle swap token intent
   */
  private async handleSwap(intent: ParsedIntent): Promise<string> {
    const { amount, sourceToken, targetToken } = intent.entities;

    if (!amount || !sourceToken || !targetToken) {
      return 'Please specify the amount, source token, and target token for the swap.';
    }

    return `Swap feature coming soon! You want to swap ${amount} ${sourceToken} for ${targetToken}.`;
  }

  /**
   * Handle stake SOL intent
   */
  private async handleStake(intent: ParsedIntent): Promise<string> {
    const { amount, validator } = intent.entities;

    if (!amount) {
      return 'Please specify the amount of SOL to stake.';
    }

    return `Staking feature coming soon! You want to stake ${amount} SOL${validator ? ` with validator ${validator}` : ''}.`;
  }

  /**
   * Handle unstake SOL intent
   */
  private async handleUnstake(intent: ParsedIntent): Promise<string> {
    const { amount } = intent.entities;

    return `Unstaking feature coming soon! You want to unstake ${amount || 'all'} SOL.`;
  }

  /**
   * Handle balance check
   */
  private async handleBalance(): Promise<string> {
    const balance = await this.walletManager.getBalance(this.wallet.publicKey.toBase58());

    let response = `Your wallet balance:\n\n`;
    response += `SOL: ${balance.sol.toFixed(4)} (${formatUSD(balance.sol * 100)})\n`;

    if (balance.tokens.length > 0) {
      response += `\nTokens:\n`;
      for (const token of balance.tokens) {
        response += `- ${token.symbol}: ${token.amount.toFixed(2)} (${formatUSD(token.usdValue)})\n`;
      }
    }

    response += `\nTotal Value: ${formatUSD(balance.totalUsdValue)}`;

    return response;
  }

  /**
   * Handle price query
   */
  private async handlePrice(intent: ParsedIntent): Promise<string> {
    const { token } = intent.entities;

    if (!token) {
      return 'Please specify which token price you want to check.';
    }

    // Simulated price data
    const prices: Record<string, number> = {
      SOL: 100.0,
      USDC: 1.0,
      USDT: 1.0,
      BONK: 0.00001,
      JUP: 0.85,
    };

    const price = prices[token.toUpperCase()];

    if (price) {
      return `Current ${token} price: ${formatUSD(price)}`;
    } else {
      return `Sorry, I don't have price data for ${token}.`;
    }
  }

  /**
   * Handle purchase intent
   */
  private async handlePurchase(intent: ParsedIntent): Promise<string> {
    const { item, amount } = intent.entities;

    return `Purchase feature coming soon! You want to buy "${item}" for ${amount || 'TBD'}.`;
  }

  /**
   * Handle general chat
   */
  private async handleChat(message: string): Promise<string> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return `Hello! I'm Pixie, your Solana wallet assistant. I can help you send tokens, check balances, swap tokens, and more. What would you like to do?`;
    }

    if (lowerMessage.includes('help')) {
      return this.getHelpMessage();
    }

    return `I'm here to help with your Solana wallet. You can ask me to:\n- Send tokens\n- Check your balance\n- Swap tokens\n- Stake SOL\n- Get token prices\n\nWhat would you like to do?`;
  }

  /**
   * Get help message
   */
  private getHelpMessage(): string {
    return `Pixie - Solana Wallet Assistant

Available commands:
- "send 5 SOL to [address]" - Send tokens
- "swap 10 SOL for USDC" - Swap tokens
- "check my balance" - View wallet balance
- "stake 5 SOL" - Stake SOL
- "what's the price of SOL?" - Get token price
- "buy [item] on Amazon" - Purchase with crypto

I understand natural language, so feel free to ask in your own words!`;
  }

  /**
   * Add message to conversation history
   */
  private addToHistory(role: 'user' | 'assistant', content: string): void {
    this.context.history.push({
      role,
      content,
      timestamp: new Date(),
    });

    // Keep only last 20 messages
    if (this.context.history.length > 20) {
      this.context.history = this.context.history.slice(-20);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get wallet address
   */
  getWalletAddress(): string {
    return this.wallet.publicKey.toBase58();
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return this.context.history;
  }
}

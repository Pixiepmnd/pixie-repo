/**
 * Wallet Manager for Solana operations
 * Handles balance queries, token management, and account state
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletBalance, TokenBalance, StakeAccount, WalletConfig } from '../types/wallet';

export class WalletManager {
  private connection: Connection;
  private config: WalletConfig;

  constructor(config: WalletConfig) {
    this.config = {
      commitment: config.commitment || 'confirmed',
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      ...config,
    };

    this.connection = new Connection(config.rpcEndpoint, {
      commitment: this.config.commitment,
      confirmTransactionInitialTimeout: this.config.timeout,
    });
  }

  /**
   * Get complete wallet balance including SOL and tokens
   */
  async getBalance(walletAddress: string): Promise<WalletBalance> {
    const publicKey = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalance = await this.connection.getBalance(publicKey);
    const sol = solBalance / LAMPORTS_PER_SOL;

    // Get token balances
    const tokens = await this.getTokenBalances(publicKey);

    // Calculate total USD value (simulated)
    const solPrice = await this.getSOLPrice();
    const solUsdValue = sol * solPrice;
    const tokensUsdValue = tokens.reduce((sum, token) => sum + token.usdValue, 0);

    return {
      sol,
      tokens,
      totalUsdValue: solUsdValue + tokensUsdValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get all token balances for a wallet
   */
  private async getTokenBalances(publicKey: PublicKey): Promise<TokenBalance[]> {
    try {
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
      });

      const balances: TokenBalance[] = [];

      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const mint = parsedInfo.mint;
        const amount = parsedInfo.tokenAmount.uiAmount;
        const decimals = parsedInfo.tokenAmount.decimals;

        if (amount > 0) {
          const tokenInfo = await this.getTokenInfo(mint);
          const price = await this.getTokenPrice(mint);

          balances.push({
            mint,
            symbol: tokenInfo.symbol,
            name: tokenInfo.name,
            amount,
            decimals,
            usdValue: amount * price,
            logoUri: tokenInfo.logoUri,
          });
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return [];
    }
  }

  /**
   * Get token metadata
   */
  private async getTokenInfo(mint: string): Promise<{
    symbol: string;
    name: string;
    logoUri?: string;
  }> {
    // Simulated token registry lookup
    // In production, this would query Jupiter token list or similar
    const knownTokens: Record<string, { symbol: string; name: string; logoUri?: string }> = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': {
        symbol: 'USDC',
        name: 'USD Coin',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
      },
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': {
        symbol: 'USDT',
        name: 'USDT',
        logoUri: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
      },
    };

    return knownTokens[mint] || { symbol: 'UNKNOWN', name: 'Unknown Token' };
  }

  /**
   * Get current SOL price in USD
   */
  private async getSOLPrice(): Promise<number> {
    // Simulated price feed
    // In production, this would query Pyth, Jupiter, or CoinGecko
    return 100.0; // $100 per SOL
  }

  /**
   * Get token price in USD
   */
  private async getTokenPrice(mint: string): Promise<number> {
    // Simulated price lookup
    const prices: Record<string, number> = {
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 1.0, // USDC
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 1.0, // USDT
    };

    return prices[mint] || 0;
  }

  /**
   * Get all stake accounts for a wallet
   */
  async getStakeAccounts(walletAddress: string): Promise<StakeAccount[]> {
    const publicKey = new PublicKey(walletAddress);

    try {
      const accounts = await this.connection.getParsedProgramAccounts(
        new PublicKey('Stake11111111111111111111111111111111111111'),
        {
          filters: [
            {
              memcmp: {
                offset: 12,
                bytes: publicKey.toBase58(),
              },
            },
          ],
        }
      );

      const stakeAccounts: StakeAccount[] = [];

      for (const { pubkey, account } of accounts) {
        const parsedData = account.data as any;
        const stakeInfo = parsedData.parsed?.info;

        if (stakeInfo) {
          stakeAccounts.push({
            address: pubkey.toBase58(),
            validator: stakeInfo.stake?.delegation?.voter || '',
            amount: (stakeInfo.stake?.delegation?.stake || 0) / LAMPORTS_PER_SOL,
            activationEpoch: stakeInfo.stake?.delegation?.activationEpoch || 0,
            deactivationEpoch: stakeInfo.stake?.delegation?.deactivationEpoch,
            rewards: 0, // Would need to calculate from history
            status: this.getStakeStatus(stakeInfo),
          });
        }
      }

      return stakeAccounts;
    } catch (error) {
      console.error('Error fetching stake accounts:', error);
      return [];
    }
  }

  /**
   * Determine stake account status
   */
  private getStakeStatus(stakeInfo: any): 'active' | 'inactive' | 'activating' | 'deactivating' {
    if (!stakeInfo.stake?.delegation) return 'inactive';
    
    const { activationEpoch, deactivationEpoch } = stakeInfo.stake.delegation;
    
    if (deactivationEpoch && deactivationEpoch !== Number.MAX_SAFE_INTEGER) {
      return 'deactivating';
    }
    
    if (activationEpoch === 0) {
      return 'activating';
    }
    
    return 'active';
  }

  /**
   * Get transaction history for a wallet
   */
  async getTransactionHistory(
    walletAddress: string,
    limit: number = 10
  ): Promise<Array<{ signature: string; timestamp: number; type: string }>> {
    const publicKey = new PublicKey(walletAddress);

    try {
      const signatures = await this.connection.getSignaturesForAddress(publicKey, {
        limit,
      });

      return signatures.map(sig => ({
        signature: sig.signature,
        timestamp: sig.blockTime || 0,
        type: 'unknown', // Would need to parse transaction to determine type
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Check if wallet has sufficient balance for transaction
   */
  async hasSufficientBalance(
    walletAddress: string,
    amount: number,
    token?: string
  ): Promise<boolean> {
    const balance = await this.getBalance(walletAddress);

    if (!token || token === 'SOL') {
      return balance.sol >= amount;
    }

    const tokenBalance = balance.tokens.find(t => t.symbol === token);
    return tokenBalance ? tokenBalance.amount >= amount : false;
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }
}

/**
 * Natural Language Parser for intent extraction
 * Uses OpenAI GPT-4 for understanding user commands
 */

import { ParsedIntent, IntentAction, EntityMap, NLPConfig, ConversationContext } from '../types/nlp';

export class NLPParser {
  private config: NLPConfig;
  private systemPrompt: string;

  constructor(config: Partial<NLPConfig> = {}) {
    this.config = {
      model: config.model || 'gpt-4-turbo-preview',
      temperature: config.temperature || 0.3,
      maxTokens: config.maxTokens || 500,
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
    };
    this.systemPrompt = this.config.systemPrompt;
  }

  /**
   * Parse user input and extract intent with entities
   */
  async parseIntent(
    userInput: string,
    context?: ConversationContext
  ): Promise<ParsedIntent> {
    const normalizedInput = this.normalizeInput(userInput);
    
    // Extract action from input
    const action = this.extractAction(normalizedInput);
    
    // Extract entities based on action
    const entities = await this.extractEntities(normalizedInput, action, context);
    
    // Calculate confidence score
    const confidence = this.calculateConfidence(action, entities);

    return {
      action,
      entities,
      confidence,
      rawText: userInput,
      timestamp: new Date(),
    };
  }

  /**
   * Extract the primary action from user input
   */
  private extractAction(input: string): IntentAction {
    const actionPatterns: Record<IntentAction, RegExp[]> = {
      [IntentAction.SEND_TOKEN]: [
        /send|transfer|pay|give/i,
        /\d+\s*(sol|usdc|usdt)/i,
      ],
      [IntentAction.SWAP_TOKEN]: [
        /swap|exchange|trade|convert/i,
        /for|to|into/i,
      ],
      [IntentAction.STAKE_SOL]: [
        /stake/i,
        /validator/i,
      ],
      [IntentAction.UNSTAKE_SOL]: [
        /unstake|withdraw/i,
      ],
      [IntentAction.CHECK_BALANCE]: [
        /balance|how much|wallet/i,
      ],
      [IntentAction.PURCHASE_ITEM]: [
        /buy|purchase|order/i,
        /amazon|product/i,
      ],
      [IntentAction.GET_PRICE]: [
        /price|cost|worth|value/i,
      ],
      [IntentAction.CHAT]: [
        /hello|hi|hey|help|what|how|can you/i,
      ],
      [IntentAction.UNKNOWN]: [],
    };

    for (const [action, patterns] of Object.entries(actionPatterns)) {
      if (patterns.some(pattern => pattern.test(input))) {
        return action as IntentAction;
      }
    }

    return IntentAction.UNKNOWN;
  }

  /**
   * Extract entities from input based on action type
   */
  private async extractEntities(
    input: string,
    action: IntentAction,
    context?: ConversationContext
  ): Promise<EntityMap> {
    const entities: EntityMap = {};

    switch (action) {
      case IntentAction.SEND_TOKEN:
        entities.amount = this.extractAmount(input);
        entities.token = this.extractToken(input);
        entities.recipient = this.extractAddress(input);
        break;

      case IntentAction.SWAP_TOKEN:
        entities.amount = this.extractAmount(input);
        entities.sourceToken = this.extractSourceToken(input);
        entities.targetToken = this.extractTargetToken(input);
        break;

      case IntentAction.STAKE_SOL:
        entities.amount = this.extractAmount(input);
        entities.validator = this.extractValidator(input);
        break;

      case IntentAction.UNSTAKE_SOL:
        entities.amount = this.extractAmount(input);
        break;

      case IntentAction.PURCHASE_ITEM:
        entities.item = this.extractItem(input);
        entities.amount = this.extractAmount(input);
        break;

      case IntentAction.GET_PRICE:
        entities.token = this.extractToken(input);
        break;
    }

    return entities;
  }

  /**
   * Extract numeric amount from input
   */
  private extractAmount(input: string): number | undefined {
    const patterns = [
      /(\d+\.?\d*)\s*(sol|usdc|usdt|tokens?)/i,
      /(\d+\.?\d*)/,
    ];

    for (const pattern of patterns) {
      const match = input.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return undefined;
  }

  /**
   * Extract token symbol from input
   */
  private extractToken(input: string): string | undefined {
    const tokenPattern = /(sol|usdc|usdt|bonk|jup|jto|pyth|wen)/i;
    const match = input.match(tokenPattern);
    return match ? match[1].toUpperCase() : undefined;
  }

  /**
   * Extract Solana address from input
   */
  private extractAddress(input: string): string | undefined {
    const addressPattern = /[1-9A-HJ-NP-Za-km-z]{32,44}/;
    const match = input.match(addressPattern);
    return match ? match[0] : undefined;
  }

  /**
   * Extract source token for swaps
   */
  private extractSourceToken(input: string): string | undefined {
    const pattern = /(?:swap|from)\s+(\w+)/i;
    const match = input.match(pattern);
    return match ? match[1].toUpperCase() : this.extractToken(input);
  }

  /**
   * Extract target token for swaps
   */
  private extractTargetToken(input: string): string | undefined {
    const pattern = /(?:to|for|into)\s+(\w+)/i;
    const match = input.match(pattern);
    return match ? match[1].toUpperCase() : undefined;
  }

  /**
   * Extract validator address or name
   */
  private extractValidator(input: string): string | undefined {
    const validatorPattern = /validator\s+([1-9A-HJ-NP-Za-km-z]{32,44})/i;
    const match = input.match(validatorPattern);
    return match ? match[1] : undefined;
  }

  /**
   * Extract item description for purchases
   */
  private extractItem(input: string): string | undefined {
    const itemPattern = /(?:buy|purchase)\s+(.+?)(?:\s+for|\s+with|$)/i;
    const match = input.match(itemPattern);
    return match ? match[1].trim() : undefined;
  }

  /**
   * Normalize user input
   */
  private normalizeInput(input: string): string {
    return input.trim().toLowerCase();
  }

  /**
   * Calculate confidence score for parsed intent
   */
  private calculateConfidence(action: IntentAction, entities: EntityMap): number {
    if (action === IntentAction.UNKNOWN) return 0.1;
    if (action === IntentAction.CHAT) return 0.9;

    let confidence = 0.5;
    const entityCount = Object.keys(entities).filter(k => entities[k] !== undefined).length;
    
    confidence += entityCount * 0.15;
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get default system prompt for GPT
   */
  private getDefaultSystemPrompt(): string {
    return `You are Pixie, an AI assistant for Solana wallet operations.
Your role is to understand user commands and extract transaction intents.

Supported operations:
- Send tokens (SOL, USDC, USDT, etc.)
- Swap tokens using Jupiter aggregator
- Stake/unstake SOL
- Check wallet balance
- Purchase items with crypto
- Get token prices
- General conversation

Extract the following from user input:
- Action type
- Token amounts
- Token symbols
- Wallet addresses
- Additional parameters

Be conversational and helpful while maintaining security awareness.`;
  }
}

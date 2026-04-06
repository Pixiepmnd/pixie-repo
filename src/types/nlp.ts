/**
 * Natural Language Processing type definitions
 */

export interface ParsedIntent {
  action: IntentAction;
  entities: EntityMap;
  confidence: number;
  rawText: string;
  timestamp: Date;
}

export enum IntentAction {
  SEND_TOKEN = 'send_token',
  SWAP_TOKEN = 'swap_token',
  STAKE_SOL = 'stake_sol',
  UNSTAKE_SOL = 'unstake_sol',
  CHECK_BALANCE = 'check_balance',
  PURCHASE_ITEM = 'purchase_item',
  GET_PRICE = 'get_price',
  CHAT = 'chat',
  UNKNOWN = 'unknown',
}

export interface EntityMap {
  amount?: number;
  token?: string;
  recipient?: string;
  sourceToken?: string;
  targetToken?: string;
  validator?: string;
  item?: string;
  [key: string]: string | number | undefined;
}

export interface NLPConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface ConversationContext {
  userId: string;
  sessionId: string;
  history: Message[];
  walletAddress: string;
  lastIntent?: ParsedIntent;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface EntityExtractionResult {
  entities: EntityMap;
  confidence: number;
  missingEntities: string[];
}

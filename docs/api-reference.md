# API Reference

Complete API documentation for Pixie wallet chatbot.

## Table of Contents

- [PixieClient](#pixieclient)
- [NLPParser](#nlpparser)
- [TransactionBuilder](#transactionbuilder)
- [WalletManager](#walletmanager)
- [JupiterIntegration](#jupiterintegration)
- [JitoIntegration](#jitointegration)
- [RiskAnalyzer](#riskanalyzer)

---

## PixieClient

Main client interface for interacting with Pixie.

### Constructor

```typescript
new PixieClient(config: PixieConfig): PixieClient
```

**Parameters:**

```typescript
interface PixieConfig {
  rpcEndpoint: string;
  wallet: Keypair;
  openaiApiKey?: string;
  enableRust?: boolean;
}
```

**Example:**

```typescript
import { Keypair } from '@solana/web3.js';
import { PixieClient } from 'pixie-wallet-bot';

const wallet = Keypair.fromSecretKey(privateKey);

const pixie = new PixieClient({
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  wallet,
  openaiApiKey: process.env.OPENAI_API_KEY,
});
```

### Methods

#### chat()

Process user message and execute intent.

```typescript
async chat(userMessage: string): Promise<string>
```

**Parameters:**
- `userMessage` (string): Natural language command

**Returns:** Promise<string> - Response message

**Example:**

```typescript
const response = await pixie.chat('send 5 SOL to ABC123');
console.log(response);
```

#### getWalletAddress()

Get the wallet's public address.

```typescript
getWalletAddress(): string
```

**Returns:** string - Base58 encoded public key

#### getHistory()

Get conversation history.

```typescript
getHistory(): Message[]
```

**Returns:** Array of conversation messages

---

## NLPParser

Natural language parser for extracting intents and entities.

### Constructor

```typescript
new NLPParser(config?: Partial<NLPConfig>): NLPParser
```

### Methods

#### parseIntent()

Parse user input and extract intent.

```typescript
async parseIntent(
  userInput: string,
  context?: ConversationContext
): Promise<ParsedIntent>
```

**Returns:**

```typescript
interface ParsedIntent {
  action: IntentAction;
  entities: EntityMap;
  confidence: number;
  rawText: string;
  timestamp: Date;
}
```

**Example:**

```typescript
const parser = new NLPParser();
const intent = await parser.parseIntent('send 5 SOL to ABC123');

console.log(intent.action); // 'send_token'
console.log(intent.entities.amount); // 5
console.log(intent.entities.token); // 'SOL'
```

---

## TransactionBuilder

Constructs and executes Solana transactions.

### Constructor

```typescript
new TransactionBuilder(
  connection: Connection,
  wallet: Keypair
): TransactionBuilder
```

### Methods

#### executeIntent()

Build and execute transaction from intent.

```typescript
async executeIntent(intent: TransactionIntent): Promise<TransactionResult>
```

**Parameters:**

```typescript
interface TransactionIntent {
  type: TransactionType;
  from: PublicKey;
  to?: PublicKey;
  amount?: number;
  token?: string;
  metadata?: Record<string, unknown>;
}
```

**Returns:**

```typescript
interface TransactionResult {
  signature: string;
  status: 'success' | 'failed' | 'pending';
  timestamp: Date;
  fee: number;
  error?: string;
}
```

#### validateTransaction()

Validate transaction before execution.

```typescript
async validateTransaction(intent: TransactionIntent): Promise<boolean>
```

---

## WalletManager

Manages wallet state and balances.

### Constructor

```typescript
new WalletManager(config: WalletConfig): WalletManager
```

### Methods

#### getBalance()

Get complete wallet balance.

```typescript
async getBalance(walletAddress: string): Promise<WalletBalance>
```

**Returns:**

```typescript
interface WalletBalance {
  sol: number;
  tokens: TokenBalance[];
  totalUsdValue: number;
  lastUpdated: Date;
}
```

**Example:**

```typescript
const balance = await walletManager.getBalance(address);
console.log(`SOL: ${balance.sol}`);
console.log(`Total Value: $${balance.totalUsdValue}`);
```

#### hasSufficientBalance()

Check if wallet has sufficient balance.

```typescript
async hasSufficientBalance(
  walletAddress: string,
  amount: number,
  token?: string
): Promise<boolean>
```

---

## JupiterIntegration

Jupiter V6 aggregator integration for token swaps.

### Constructor

```typescript
new JupiterIntegration(config?: JupiterConfig): JupiterIntegration
```

### Methods

#### getQuote()

Get swap quote from Jupiter.

```typescript
async getQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps?: number
): Promise<SwapQuote>
```

**Example:**

```typescript
const jupiter = new JupiterIntegration();
const quote = await jupiter.getQuote(
  'So11111111111111111111111111111111111111112', // SOL
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  1000000000 // 1 SOL
);

console.log(`Output: ${quote.outAmount} USDC`);
console.log(`Price Impact: ${quote.priceImpact}%`);
```

#### executeSwap()

Execute token swap.

```typescript
async executeSwap(
  connection: Connection,
  inputMint: string,
  outputMint: string,
  amount: number,
  userPublicKey: PublicKey,
  signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>
): Promise<string>
```

---

## JitoIntegration

Jito MEV protection integration.

### Constructor

```typescript
new JitoIntegration(config?: JitoConfig): JitoIntegration
```

### Methods

#### submitBundle()

Submit transaction bundle to Jito.

```typescript
async submitBundle(
  transactions: (Transaction | VersionedTransaction)[],
  connection: Connection
): Promise<BundleResult>
```

#### submitProtectedTransaction()

Submit single transaction with MEV protection.

```typescript
async submitProtectedTransaction(
  transaction: Transaction | VersionedTransaction,
  payer: Keypair,
  connection: Connection
): Promise<string>
```

---

## RiskAnalyzer

Security and risk analysis for transactions.

### Constructor

```typescript
new RiskAnalyzer(connection: Connection): RiskAnalyzer
```

### Methods

#### analyzeToken()

Analyze token for risks.

```typescript
async analyzeToken(tokenMint: string): Promise<RiskAssessment>
```

**Returns:**

```typescript
interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  flags: RiskFlag[];
  recommendations: string[];
  isHoneyPot: boolean;
  isSuspicious: boolean;
}
```

**Example:**

```typescript
const analyzer = new RiskAnalyzer(connection);
const risk = await analyzer.analyzeToken(tokenMint);

if (risk.riskLevel === 'critical') {
  console.log('WARNING: Do not proceed!');
  risk.recommendations.forEach(rec => console.log(rec));
}
```

#### analyzeTransaction()

Analyze transaction for risks.

```typescript
async analyzeTransaction(
  from: string,
  to: string,
  amount: number,
  token?: string
): Promise<RiskAssessment>
```

---

## Error Handling

All methods may throw the following errors:

```typescript
class ValidationError extends Error {
  constructor(message: string);
}

class TransactionError extends Error {
  constructor(message: string, signature?: string);
}

class NetworkError extends Error {
  constructor(message: string);
}
```

**Example:**

```typescript
try {
  const result = await pixie.chat('send 5 SOL to invalid');
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Validation failed:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Type Definitions

See [types/nlp.ts](../src/types/nlp.ts) and [types/wallet.ts](../src/types/wallet.ts) for complete type definitions.

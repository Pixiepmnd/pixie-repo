# Quickstart Guide

Get started with Pixie in 5 minutes.

## Installation

```bash
npm install pixie-wallet-bot
# or
yarn add pixie-wallet-bot
```

## Basic Setup

```typescript
import { Keypair } from '@solana/web3.js';
import { PixieClient } from 'pixie-wallet-bot';

// Load your wallet
const wallet = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(process.env.WALLET_PRIVATE_KEY!))
);

// Create Pixie client
const pixie = new PixieClient({
  rpcEndpoint: 'https://api.mainnet-beta.solana.com',
  wallet,
});

// Start chatting!
const response = await pixie.chat('what is my balance?');
console.log(response);
```

## Common Operations

### Check Balance

```typescript
await pixie.chat('what is my balance?');
await pixie.chat('show me my tokens');
```

### Send Tokens

```typescript
await pixie.chat('send 0.1 SOL to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK');
await pixie.chat('transfer 5 USDC to my friend');
```

### Swap Tokens

```typescript
await pixie.chat('swap 1 SOL for USDC');
await pixie.chat('exchange 100 USDC to SOL');
```

### Get Prices

```typescript
await pixie.chat('what is the price of SOL?');
await pixie.chat('how much is BONK worth?');
```

## Environment Setup

Create a `.env` file:

```bash
# Required
RPC_ENDPOINT=https://api.mainnet-beta.solana.com
WALLET_PRIVATE_KEY=[1,2,3,...]

# Optional
OPENAI_API_KEY=sk-...
LOG_LEVEL=info
```

## Security Best Practices

1. **Never commit private keys**
2. **Use environment variables**
3. **Start with small amounts**
4. **Enable risk analysis**
5. **Verify addresses before sending**

## Next Steps

- Read the [Architecture Guide](./architecture.md)
- Check the [API Reference](./api-reference.md)
- Explore [Examples](../examples/)
- Join our [Community](https://t.me/PixieDeFI)

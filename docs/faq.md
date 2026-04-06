# Frequently Asked Questions

## General Questions

### What is Pixie?

Pixie is an AI-powered Solana wallet chatbot that allows you to interact with your wallet using natural language. Instead of complex commands, just chat with Pixie to send tokens, swap, stake, and more.

### Is Pixie safe to use?

Yes, Pixie implements multiple security layers:
- Risk analysis for all transactions
- Honey pot detection
- Address validation
- Balance checks
- MEV protection via Jito

However, always start with small amounts and verify addresses before sending.

### What can Pixie do?

- Send SOL and SPL tokens
- Swap tokens via Jupiter
- Check wallet balance
- Get token prices
- Stake/unstake SOL
- Transaction history
- Risk analysis

## Technical Questions

### What blockchain does Pixie support?

Currently, Pixie only supports Solana. Support for other chains may be added in the future.

### Do I need an API key?

- **Required**: Solana RPC endpoint (can use public endpoints)
- **Optional**: OpenAI API key for advanced NLP features
- **Optional**: Custom RPC for better performance

### How does the NLP work?

Pixie uses pattern matching and entity extraction to understand your commands. For complex queries, it can optionally use GPT-4 for better understanding.

### Can I use Pixie programmatically?

Yes! Pixie provides a TypeScript SDK:

```typescript
import { PixieClient } from 'pixie-wallet-bot';

const pixie = new PixieClient({ ... });
const response = await pixie.chat('send 1 SOL to ...');
```

## Usage Questions

### How do I send tokens?

Just tell Pixie what you want to do:

```
"send 5 SOL to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
"transfer 10 USDC to my friend"
"pay 0.5 SOL to that address"
```

### How do I swap tokens?

```
"swap 1 SOL for USDC"
"exchange 100 USDC to SOL"
"trade 5 SOL for BONK"
```

### How do I check my balance?

```
"what is my balance?"
"show me my tokens"
"how much SOL do I have?"
```

### What if Pixie doesn't understand?

Try rephrasing your command or being more specific:

```
❌ "send some SOL"
✅ "send 0.1 SOL to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
```

## Security Questions

### Where are my private keys stored?

Private keys are stored in your environment variables and never transmitted. Pixie only uses them locally to sign transactions.

### Can Pixie access my wallet without permission?

No. Pixie requires explicit commands to perform any transaction. It cannot act autonomously.

### What is honey pot detection?

Honey pots are scam tokens that you can buy but cannot sell. Pixie analyzes tokens before swaps to detect these scams.

### Should I use Pixie on mainnet?

Yes, but:
1. Start with small amounts
2. Verify all addresses
3. Enable risk analysis
4. Use trusted RPC endpoints
5. Keep your private keys secure

## Performance Questions

### Why is my transaction slow?

Possible reasons:
- Network congestion
- RPC rate limiting
- Low priority fee
- Complex swap routes

Try:
- Using a premium RPC
- Increasing Jito tip
- Waiting for lower congestion

### Can I speed up transactions?

Yes:
- Use Jito MEV protection with higher tips
- Use premium RPC endpoints
- Increase priority fees

### How many transactions per second?

Depends on:
- RPC rate limits
- Network conditions
- Transaction complexity

Typical: 5-10 TPS with standard RPC

## Troubleshooting

### "Insufficient balance" error

Check:
1. Do you have enough SOL for the transaction?
2. Do you have enough for transaction fees?
3. Is the token balance correct?

### "Invalid address" error

Ensure:
1. Address is 32-44 characters
2. Address is base58 encoded
3. No typos or extra spaces

### "Transaction failed" error

Common causes:
1. Network congestion
2. Slippage too low
3. Insufficient balance
4. Invalid token mint

### "Rate limit exceeded" error

Solutions:
1. Wait a few seconds
2. Use premium RPC
3. Reduce request frequency

## Integration Questions

### Can I integrate Pixie into my app?

Yes! Pixie provides:
- TypeScript SDK
- REST API (coming soon)
- WebSocket support (coming soon)

### Does Pixie have a mobile app?

Not yet, but the SDK can be used in React Native apps.

### Can I customize Pixie?

Yes! Pixie is open source. You can:
- Fork the repository
- Add custom commands
- Integrate new DEXs
- Customize risk analysis

## Pricing Questions

### Is Pixie free?

Yes, Pixie is open source and free to use. You only pay:
- Solana transaction fees
- RPC costs (if using premium)
- OpenAI API costs (if enabled)

### What are the transaction fees?

- Base transaction: ~0.000005 SOL
- Token swap: ~0.00001 SOL
- Jito tip: 0.0001-0.001 SOL (optional)

## Support

### Where can I get help?

- GitHub Issues: https://github.com/Pixiepmnd/pixie-repo/issues
- Telegram: https://t.me/PixieDeFI
- Twitter: https://x.com/PixieDeFI
- Website: https://www.pixiedefi.space

### How do I report a bug?

1. Check existing issues
2. Create new issue with:
   - Description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### How can I contribute?

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

### Is there a roadmap?

Yes! Check [CHANGELOG.md](../CHANGELOG.md) for planned features.

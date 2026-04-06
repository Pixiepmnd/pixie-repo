# Troubleshooting Guide

Common issues and solutions for Pixie.

## Installation Issues

### npm install fails

**Problem**: Dependencies fail to install

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Rust build fails

**Problem**: Cargo build errors

**Solutions**:
```bash
# Update Rust
rustup update

# Clean build
cargo clean
cargo build --release
```

## Runtime Issues

### "Cannot find module" error

**Problem**: Module import errors

**Solutions**:
```bash
# Rebuild TypeScript
npm run build:ts

# Check tsconfig.json paths
# Verify dist/ directory exists
```

### "RPC endpoint not responding"

**Problem**: Connection to Solana RPC fails

**Solutions**:
1. Check RPC endpoint URL
2. Verify network connectivity
3. Try alternative RPC:
   ```bash
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   ```
4. Use premium RPC for better reliability

### "Insufficient balance" error

**Problem**: Transaction fails due to low balance

**Solutions**:
1. Check wallet balance:
   ```typescript
   await pixie.chat('what is my balance?');
   ```
2. Ensure enough SOL for fees (~0.000005 SOL)
3. Verify token balance is correct

## Transaction Issues

### Transaction timeout

**Problem**: Transaction takes too long

**Solutions**:
1. Increase timeout:
   ```typescript
   const config = {
     timeout: 60000, // 60 seconds
   };
   ```
2. Check network congestion
3. Use Jito for faster confirmation

### "Transaction simulation failed"

**Problem**: Pre-flight simulation fails

**Solutions**:
1. Check slippage settings
2. Verify token addresses
3. Ensure sufficient balance
4. Try smaller amount

### High slippage error

**Problem**: Price impact too high

**Solutions**:
1. Reduce swap amount
2. Increase slippage tolerance
3. Wait for better liquidity
4. Split into multiple swaps

## NLP Issues

### Commands not understood

**Problem**: Pixie doesn't parse intent correctly

**Solutions**:
1. Be more specific:
   ```
   ❌ "send some SOL"
   ✅ "send 0.1 SOL to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
   ```
2. Use standard formats
3. Include all required parameters

### Wrong intent detected

**Problem**: Pixie misinterprets command

**Solutions**:
1. Use clearer keywords:
   - "send" for transfers
   - "swap" for exchanges
   - "balance" for checking
2. Avoid ambiguous phrases
3. Provide feedback via GitHub issues

## Security Issues

### "Risk level too high" warning

**Problem**: Transaction blocked by risk analyzer

**Solutions**:
1. Review risk assessment
2. Verify token contract
3. Check for honey pots
4. Start with small test amount
5. Override if you trust the token

### Address validation fails

**Problem**: Valid address rejected

**Solutions**:
1. Verify address format (base58)
2. Check address length (32-44 chars)
3. Remove extra spaces
4. Ensure no special characters

## Performance Issues

### Slow response times

**Problem**: Commands take too long

**Solutions**:
1. Use premium RPC endpoint
2. Enable caching
3. Reduce concurrent requests
4. Check network latency

### High memory usage

**Problem**: Application uses too much memory

**Solutions**:
1. Clear cache periodically
2. Limit conversation history
3. Restart application
4. Check for memory leaks

### Rate limiting errors

**Problem**: Too many requests

**Solutions**:
1. Implement rate limiting:
   ```typescript
   const limiter = new RateLimiter({
     maxRequests: 10,
     windowMs: 1000,
   });
   ```
2. Use request queuing
3. Upgrade RPC plan

## Integration Issues

### TypeScript errors

**Problem**: Type checking fails

**Solutions**:
```bash
# Update types
npm install --save-dev @types/node

# Check tsconfig.json
npm run type-check
```

### Import errors

**Problem**: Cannot import Pixie modules

**Solutions**:
```typescript
// Use correct import syntax
import { PixieClient } from 'pixie-wallet-bot';

// Not
import PixieClient from 'pixie-wallet-bot';
```

## Debugging

### Enable debug logging

```bash
LOG_LEVEL=debug npm run dev
```

### Check transaction details

```typescript
const result = await pixie.chat('send 1 SOL to ...');
console.log('Transaction:', result);
```

### Inspect parsed intent

```typescript
const parser = new NLPParser();
const intent = await parser.parseIntent('your command');
console.log('Intent:', intent);
```

### Monitor metrics

```typescript
import { metrics } from 'pixie-wallet-bot';

// Record metrics
metrics.record('transaction_time', duration);

// View metrics
console.log(metrics.getAllMetrics());
```

## Getting Help

If you can't resolve the issue:

1. **Check Documentation**
   - [FAQ](./faq.md)
   - [API Reference](./api-reference.md)
   - [Architecture](./architecture.md)

2. **Search Issues**
   - [GitHub Issues](https://github.com/Pixiepmnd/pixie-repo/issues)

3. **Ask Community**
   - [Telegram](https://t.me/PixieDeFI)
   - [Twitter](https://x.com/PixieDeFI)

4. **Report Bug**
   - Create detailed issue with:
     - Error message
     - Steps to reproduce
     - Environment details
     - Expected vs actual behavior

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| VALIDATION_ERROR | Invalid input | Check parameters |
| INSUFFICIENT_BALANCE | Not enough funds | Add funds or reduce amount |
| NETWORK_ERROR | RPC connection failed | Check endpoint |
| TRANSACTION_ERROR | TX failed | Review transaction details |
| RATE_LIMIT_ERROR | Too many requests | Wait and retry |
| PARSE_ERROR | Cannot understand command | Rephrase command |
| RISK_ERROR | High risk detected | Review risk assessment |

## Logs Location

- Application logs: `./logs/pixie.log`
- Error logs: `./logs/error.log`
- Transaction logs: `./logs/transactions.log`

## Support Channels

- Email: support@pixiedefi.space
- Telegram: https://t.me/PixieDeFI
- GitHub: https://github.com/Pixiepmnd/pixie-repo

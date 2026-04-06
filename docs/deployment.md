# Deployment Guide

Guide for deploying Pixie in production environments.

## Prerequisites

- Node.js 18+
- Rust 1.70+ (optional, for Rust components)
- Solana CLI tools
- Production RPC endpoint

## Environment Configuration

### Production Environment Variables

```bash
# Solana Configuration
RPC_ENDPOINT=https://your-production-rpc.com
COMMITMENT=confirmed

# Wallet Configuration
WALLET_PRIVATE_KEY=[...]  # Secure storage recommended

# API Keys
OPENAI_API_KEY=sk-...

# Jito Configuration (optional)
JITO_BLOCK_ENGINE_URL=https://mainnet.block-engine.jito.wtf
JITO_TIP_AMOUNT=0.0001

# Logging
LOG_LEVEL=info
NODE_ENV=production

# Rate Limiting
MAX_REQUESTS_PER_MINUTE=60
MAX_CONCURRENT_TRANSACTIONS=5
```

## Build for Production

```bash
# Install dependencies
npm ci --production

# Build TypeScript
npm run build:ts

# Build Rust components
cargo build --release

# Run tests
npm test
```

## Deployment Options

### Option 1: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

Build and run:

```bash
docker build -t pixie-bot .
docker run -d --env-file .env pixie-bot
```

### Option 2: PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/index.js --name pixie-bot

# Save configuration
pm2 save

# Setup startup script
pm2 startup
```

### Option 3: Systemd Service

Create `/etc/systemd/system/pixie.service`:

```ini
[Unit]
Description=Pixie Wallet Bot
After=network.target

[Service]
Type=simple
User=pixie
WorkingDirectory=/opt/pixie
ExecStart=/usr/bin/node dist/index.js
Restart=always
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable pixie
sudo systemctl start pixie
```

## Security Considerations

### Private Key Management

1. **Never commit private keys**
2. **Use environment variables**
3. **Consider hardware wallets**
4. **Implement key rotation**
5. **Use encrypted storage**

### Network Security

```bash
# Use firewall
sudo ufw allow 22/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# SSL/TLS for API endpoints
# Use Let's Encrypt or similar
```

### Monitoring

```bash
# Setup monitoring
npm install @sentry/node

# Configure error tracking
# Add health check endpoints
# Setup alerting
```

## Performance Optimization

### Caching Strategy

```typescript
// Implement Redis for distributed caching
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: 6379,
});
```

### Load Balancing

```nginx
upstream pixie_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    server_name pixie.example.com;

    location / {
        proxy_pass http://pixie_backend;
    }
}
```

## Monitoring and Logging

### Structured Logging

```typescript
import { logger } from './utils/logger';

logger.info('Transaction executed', {
  signature: tx.signature,
  amount: tx.amount,
  token: tx.token,
});
```

### Metrics Collection

```typescript
// Prometheus metrics
import prometheus from 'prom-client';

const transactionCounter = new prometheus.Counter({
  name: 'pixie_transactions_total',
  help: 'Total number of transactions',
});
```

## Backup and Recovery

### Database Backups

```bash
# Backup conversation history
pg_dump pixie_db > backup.sql

# Restore
psql pixie_db < backup.sql
```

### Wallet Backups

```bash
# Backup wallet keys (encrypted)
gpg -c wallet-keys.json

# Store in secure location
aws s3 cp wallet-keys.json.gpg s3://secure-bucket/
```

## Scaling

### Horizontal Scaling

- Use stateless design
- Implement session management
- Use message queues
- Deploy multiple instances

### Vertical Scaling

- Optimize database queries
- Implement connection pooling
- Use caching extensively
- Profile and optimize hot paths

## Health Checks

```typescript
app.get('/health', async (req, res) => {
  const checks = {
    rpc: await checkRPCConnection(),
    database: await checkDatabase(),
    cache: await checkCache(),
  };

  const healthy = Object.values(checks).every(c => c);
  res.status(healthy ? 200 : 503).json(checks);
});
```

## Troubleshooting

### Common Issues

1. **RPC Rate Limiting**
   - Use multiple RPC endpoints
   - Implement request queuing
   - Add retry logic

2. **Transaction Failures**
   - Check network congestion
   - Increase timeout values
   - Verify wallet balance

3. **Memory Leaks**
   - Monitor memory usage
   - Implement proper cleanup
   - Use memory profiling tools

## Support

For deployment assistance:
- Documentation: https://github.com/Pixiepmnd/pixie-repo
- Community: https://t.me/PixieDeFI
- Email: support@pixiedefi.space

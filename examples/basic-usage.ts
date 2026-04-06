/**
 * Basic Usage Example for Pixie
 * Demonstrates simple wallet operations
 */

import { Keypair } from '@solana/web3.js';
import { PixieClient } from '../src/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize wallet from private key
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('WALLET_PRIVATE_KEY not found in environment');
  }

  const wallet = Keypair.fromSecretKey(
    Buffer.from(JSON.parse(privateKey))
  );

  // Create Pixie client
  const pixie = new PixieClient({
    rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    wallet,
    openaiApiKey: process.env.OPENAI_API_KEY,
  });

  console.log('Pixie Wallet Bot - Basic Usage Example');
  console.log('======================================\n');
  console.log(`Wallet Address: ${pixie.getWalletAddress()}\n`);

  // Example 1: Check balance
  console.log('Example 1: Check Balance');
  console.log('-------------------------');
  const balanceResponse = await pixie.chat('what is my balance?');
  console.log(balanceResponse);
  console.log('\n');

  // Example 2: Get token price
  console.log('Example 2: Get Token Price');
  console.log('--------------------------');
  const priceResponse = await pixie.chat('what is the price of SOL?');
  console.log(priceResponse);
  console.log('\n');

  // Example 3: Send tokens (simulated)
  console.log('Example 3: Send Tokens');
  console.log('----------------------');
  const sendResponse = await pixie.chat(
    'send 0.01 SOL to DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK'
  );
  console.log(sendResponse);
  console.log('\n');

  // Example 4: Swap tokens (simulated)
  console.log('Example 4: Swap Tokens');
  console.log('----------------------');
  const swapResponse = await pixie.chat('swap 1 SOL for USDC');
  console.log(swapResponse);
  console.log('\n');

  // Example 5: General chat
  console.log('Example 5: General Chat');
  console.log('-----------------------');
  const chatResponse = await pixie.chat('hello, what can you help me with?');
  console.log(chatResponse);
  console.log('\n');

  // Show conversation history
  console.log('Conversation History:');
  console.log('--------------------');
  const history = pixie.getHistory();
  history.forEach((msg, i) => {
    console.log(`${i + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}...`);
  });
}

main().catch(console.error);

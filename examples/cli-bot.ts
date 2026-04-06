/**
 * CLI Bot Example
 * Interactive command-line interface for Pixie
 */

import * as readline from 'readline';
import { Keypair } from '@solana/web3.js';
import { PixieClient } from '../src/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize Pixie
  const privateKey = process.env.WALLET_PRIVATE_KEY;
  if (!privateKey) {
    console.error('Error: WALLET_PRIVATE_KEY not found in environment');
    process.exit(1);
  }

  const wallet = Keypair.fromSecretKey(Buffer.from(JSON.parse(privateKey)));

  const pixie = new PixieClient({
    rpcEndpoint: process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    wallet,
  });

  console.log('╔════════════════════════════════════════╗');
  console.log('║     Pixie - Solana Wallet Bot         ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');
  console.log(`Wallet: ${pixie.getWalletAddress()}`);
  console.log('');
  console.log('Type your commands in natural language.');
  console.log('Type "exit" to quit.\n');

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '💬 You: ',
  });

  rl.prompt();

  rl.on('line', async (input: string) => {
    const message = input.trim();

    if (message.toLowerCase() === 'exit') {
      console.log('\n👋 Goodbye!');
      rl.close();
      process.exit(0);
    }

    if (!message) {
      rl.prompt();
      return;
    }

    try {
      console.log('🤖 Pixie: Processing...\n');
      const response = await pixie.chat(message);
      console.log(`🤖 Pixie: ${response}\n`);
    } catch (error) {
      console.error(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    rl.prompt();
  });

  rl.on('close', () => {
    console.log('\n👋 Goodbye!');
    process.exit(0);
  });
}

main().catch(console.error);

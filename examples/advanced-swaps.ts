/**
 * Advanced Swap Example
 * Demonstrates Jupiter integration with MEV protection
 */

import { Keypair, Connection } from '@solana/web3.js';
import { JupiterIntegration } from '../src/integrations/jupiter';
import { JitoIntegration } from '../src/integrations/jito';
import { RiskAnalyzer } from '../src/security/risk-analyzer';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const rpcEndpoint = process.env.RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com';
  const connection = new Connection(rpcEndpoint, 'confirmed');

  // Initialize integrations
  const jupiter = new JupiterIntegration({
    slippageBps: 50, // 0.5% slippage
  });

  const jito = new JitoIntegration({
    tipAmount: 0.0001, // 0.0001 SOL tip
  });

  const riskAnalyzer = new RiskAnalyzer(connection);

  console.log('Pixie - Advanced Swap Example');
  console.log('=============================\n');

  // Example token mints
  const SOL_MINT = 'So11111111111111111111111111111111111111112';
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  // Step 1: Analyze token risk
  console.log('Step 1: Analyzing Token Risk');
  console.log('----------------------------');
  const riskAssessment = await riskAnalyzer.analyzeToken(USDC_MINT);
  console.log(`Risk Level: ${riskAssessment.riskLevel}`);
  console.log(`Risk Score: ${riskAssessment.score}/100`);
  console.log(`Flags: ${riskAssessment.flags.length}`);
  console.log(`Recommendations:`);
  riskAssessment.recommendations.forEach(rec => console.log(`  - ${rec}`));
  console.log('\n');

  // Step 2: Get swap quote
  console.log('Step 2: Getting Swap Quote');
  console.log('--------------------------');
  const amount = 1 * 1e9; // 1 SOL in lamports
  
  try {
    const quote = await jupiter.getQuote(SOL_MINT, USDC_MINT, amount);
    console.log(`Input: ${quote.inAmount / 1e9} SOL`);
    console.log(`Output: ${quote.outAmount / 1e6} USDC`);
    console.log(`Price Impact: ${quote.priceImpact.toFixed(4)}%`);
    console.log(`Estimated Fee: ${quote.estimatedFee} SOL`);
    console.log(`Route Steps: ${quote.route.length}`);
    console.log('\n');

    // Step 3: Get optimal route
    console.log('Step 3: Finding Optimal Route');
    console.log('-----------------------------');
    const optimalQuote = await jupiter.getOptimalRoute(SOL_MINT, USDC_MINT, amount);
    console.log(`Best Output: ${optimalQuote.outAmount / 1e6} USDC`);
    console.log(`Improvement: ${((optimalQuote.outAmount - quote.outAmount) / quote.outAmount * 100).toFixed(2)}%`);
    console.log('\n');

    // Step 4: Estimate MEV protection
    console.log('Step 4: MEV Protection Analysis');
    console.log('-------------------------------');
    const tipAmount = jito.calculateOptimalTip('medium');
    console.log(`Recommended Tip: ${tipAmount} SOL`);
    
    const regions = jito.getRegions();
    console.log(`Available Regions: ${regions.length}`);
    regions.forEach(region => console.log(`  - ${region}`));
    console.log('\n');

  } catch (error) {
    console.error('Error during swap simulation:', error);
  }

  // Step 5: Token list
  console.log('Step 5: Available Tokens');
  console.log('------------------------');
  try {
    const tokens = await jupiter.getTokenList();
    console.log(`Total Tokens: ${tokens.length}`);
    console.log('Sample tokens:');
    tokens.slice(0, 5).forEach(token => {
      console.log(`  - ${token.symbol} (${token.name})`);
    });
  } catch (error) {
    console.log('Unable to fetch token list (simulated)');
  }

  console.log('\n✅ Advanced swap example completed!');
}

main().catch(console.error);

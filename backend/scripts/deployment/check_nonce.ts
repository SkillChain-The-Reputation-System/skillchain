// Script to check and reset nonce if needed
import { createPublicClient, http, parseEther } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'

dotenv.config()

async function checkNonce() {
  if (!process.env.PRIVATE_KEY || !process.env.AMOY_RPC_URL) {
    console.error('❌ Missing environment variables')
    return
  }

  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}` as `0x${string}`)
  
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(process.env.AMOY_RPC_URL),
  })

  console.log('🔍 Checking account status...')
  console.log(`📍 Account: ${account.address}`)
  
  try {
    const [nonce, balance] = await Promise.all([
      publicClient.getTransactionCount({ address: account.address }),
      publicClient.getBalance({ address: account.address })
    ])

    console.log(`🔢 Current nonce: ${nonce}`)
    console.log(`💰 Balance: ${balance} wei (${Number(balance) / 1e18} MATIC)`)
    
    // Check if balance is sufficient for deployment
    const minimumBalance = parseEther('0.1') // 0.1 MATIC
    if (balance < minimumBalance) {
      console.log('⚠️  WARNING: Balance might be insufficient for deployment')
      console.log(`   Recommended minimum: 0.1 MATIC`)
    } else {
      console.log('✅ Balance is sufficient for deployment')
    }
    
    // Check deployment state
    const deploymentPath = path.join(
      __dirname,
      "../..",
      "ignition",
      "deployments",
      "chain-80002",
      "journal.jsonl"
    )
    
    if (fs.existsSync(deploymentPath)) {
      console.log('\n📊 Deployment state analysis:')
      const content = fs.readFileSync(deploymentPath, 'utf8')
      const lines = content.trim().split('\n').filter(line => line.trim())
      
      if (lines.length > 0) {
        console.log(`   - Journal entries: ${lines.length}`)
        
        // Check last few entries
        const lastEntries = lines.slice(-5)
        let lastNonce: number | undefined
        let hasPendingTx = false
        
        for (const line of lastEntries) {
          try {
            const entry = JSON.parse(line)
            if (entry.nonce !== undefined) {
              lastNonce = entry.nonce
            }
            if (entry.type === 'TRANSACTION_PREPARE_SEND' || entry.type === 'NETWORK_INTERACTION_REQUEST') {
              hasPendingTx = true
            }
          } catch (e) {
            // Skip malformed entries
          }
        }
        
        if (lastNonce !== undefined) {
          console.log(`   - Last deployment nonce: ${lastNonce}`)
          if (nonce > lastNonce) {
            console.log(`   ✅ On-chain nonce (${nonce}) is ahead of deployment nonce (${lastNonce})`)
          } else if (nonce === lastNonce) {
            console.log(`   ⚠️  On-chain nonce matches last deployment nonce - potential issue`)
          } else {
            console.log(`   ❌ On-chain nonce (${nonce}) is behind deployment nonce (${lastNonce}) - PROBLEM!`)
          }
        }
        
        if (hasPendingTx) {
          console.log('   ⚠️  Found pending transactions in deployment state')
          console.log('   💡 Consider running: npm run clean-deployment-state')
        } else {
          console.log('   ✅ No pending transactions found')
        }
      } else {
        console.log('   - Empty deployment journal')
      }
    } else {
      console.log('\n✅ No existing deployment state found')
    }
    
    // Test RPC connectivity
    console.log('\n🌐 Testing RPC connectivity...')
    const blockNumber = await publicClient.getBlockNumber()
    console.log(`   Latest block: ${blockNumber}`)
    console.log('   ✅ RPC connection is working')
    
  } catch (error) {
    console.error('❌ Error checking nonce or connectivity:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  }
}

checkNonce().catch(console.error)

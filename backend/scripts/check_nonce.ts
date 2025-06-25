// Script to check and reset nonce if needed
import { createPublicClient, createWalletClient, http, parseEther } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import * as dotenv from 'dotenv'

dotenv.config()

async function checkNonce() {
  if (!process.env.PRIVATE_KEY || !process.env.AMOY_RPC_URL) {
    console.error('Missing environment variables')
    return
  }

  const account = privateKeyToAccount(`0x${process.env.PRIVATE_KEY}` as `0x${string}`)
  
  const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(process.env.AMOY_RPC_URL),
  })

  const nonce = await publicClient.getTransactionCount({
    address: account.address,
  })

  console.log(`Account: ${account.address}`)
  console.log(`Current nonce: ${nonce}`)
  
  const balance = await publicClient.getBalance({
    address: account.address,
  })
  
  console.log(`Balance: ${balance} wei (${Number(balance) / 1e18} MATIC)`)
}

checkNonce().catch(console.error)

#!/bin/bash

# Regenerate contracts config with dual-network support
# This script will read deployment addresses from both localhost and Amoy
# and generate a single config file that works for both networks

echo "🔄 Regenerating contracts-config.ts with dual-network support..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Check if both network deployments exist
LOCALHOST_DEPLOYMENT="ignition/deployments/chain-31337/deployed_addresses.json"
AMOY_DEPLOYMENT="ignition/deployments/chain-80002/deployed_addresses.json"

if [ ! -f "$LOCALHOST_DEPLOYMENT" ]; then
    echo "⚠️  Localhost deployment not found at $LOCALHOST_DEPLOYMENT"
    echo "   Run: npm run deploy (or deploy to localhost first)"
fi

if [ ! -f "$AMOY_DEPLOYMENT" ]; then
    echo "⚠️  Amoy deployment not found at $AMOY_DEPLOYMENT"
    echo "   Run: npm run deploy:amoy (or deploy to Amoy first)"
fi

# Generate the config regardless - it will work with whichever deployments exist
echo "🏗️  Generating config from available deployments..."

# Use localhost as the base, but the script will read from both networks
NETWORK=localhost CHAIN_ID=31337 node -r ts-node/register scripts/deploy_and_copy.ts --generate-only

echo "✅ Done! Check frontend/src/constants/contracts-config.ts"

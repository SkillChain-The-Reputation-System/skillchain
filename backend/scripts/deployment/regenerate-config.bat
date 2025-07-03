@echo off
REM Regenerate contracts config with dual-network support
REM This script will read deployment addresses from both localhost and Amoy
REM and generate a single config file that works for both networks

echo 🔄 Regenerating contracts-config.ts with dual-network support...

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if both network deployments exist
set LOCALHOST_DEPLOYMENT=ignition\deployments\chain-31337\deployed_addresses.json
set AMOY_DEPLOYMENT=ignition\deployments\chain-80002\deployed_addresses.json

if not exist "%LOCALHOST_DEPLOYMENT%" (
    echo ⚠️  Localhost deployment not found at %LOCALHOST_DEPLOYMENT%
    echo    Run: npm run deploy ^(or deploy to localhost first^)
)

if not exist "%AMOY_DEPLOYMENT%" (
    echo ⚠️  Amoy deployment not found at %AMOY_DEPLOYMENT%
    echo    Run: npm run deploy:amoy ^(or deploy to Amoy first^)
)

REM Generate the config regardless - it will work with whichever deployments exist
echo 🏗️  Generating config from available deployments...

REM Use localhost as the base, but the script will read from both networks
set NETWORK=localhost
set CHAIN_ID=31337
node -r ts-node/register scripts/deploy_and_copy.ts --generate-only

echo ✅ Done! Check frontend/src/constants/contracts-config.ts
pause

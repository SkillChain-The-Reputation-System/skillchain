# SkillChain Backend

This package contains the smart contracts and deployment scripts.

## Deploy to Polygon Amoy

1. Copy `.env.example` to `.env` and provide your `AMOY_RPC_URL`, `PRIVATE_KEY` and optional `CHAIN_ID`.
2. Install dependencies with `npm install`.
3. Run the deployment script:
   ```bash
   npm run deploy:amoy
   ```

This will deploy the contracts to Amoy and copy the generated ABIs and addresses to the frontend.

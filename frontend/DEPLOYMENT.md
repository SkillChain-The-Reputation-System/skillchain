# SkillChain Frontend Deployment Guide

This guide will help you deploy the SkillChain frontend to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com/)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Environment Variables**: You'll need the following API keys and configuration

## Required Environment Variables

Before deploying, you need to obtain these values:

### 1. WalletConnect Project ID
- Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
- Create a new project
- Copy the Project ID

### 2. Alchemy API Key
- Go to [Alchemy](https://www.alchemy.com/)
- Create an account and a new app
- Copy the API key

### 3. JAAS API Key (Optional - for Jitsi Meet)
- Go to [Jitsi as a Service](https://jaas.8x8.vc/)
- Sign up and get your API key

### 4. Polygon Amoy RPC URL
- Use: `https://rpc-amoy.polygon.technology/`

### 5. SkillChain Wallet Private Key
- Your deployed smart contract owner's private key
- **Keep this secure and never share it!**

## Deployment Methods

### Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   - In your Vercel project settings, go to "Environment Variables"
   - Add each of the following variables:
     ```
     NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_value
     NEXT_PUBLIC_ALCHEMY_API_KEY=your_actual_value
     POLYGON_AMOY_RPC_URL=https://rpc-amoy.polygon.technology/
     SKILLCHAIN_WALLET_PRIVATE_KEY=your_actual_private_key
     JAAS_API_KEY=your_actual_jaas_key
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### Method 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

4. **Deploy**:
   ```bash
   # For preview deployment
   npm run deploy:preview
   
   # For production deployment
   npm run deploy
   ```

5. **Set Environment Variables via CLI**:
   ```bash
   vercel env add NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
   vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
   vercel env add POLYGON_AMOY_RPC_URL
   vercel env add SKILLCHAIN_WALLET_PRIVATE_KEY
   vercel env add JAAS_API_KEY
   ```

## Post-Deployment Steps

1. **Verify Deployment**:
   - Visit your deployed URL
   - Test wallet connection functionality
   - Verify all features work correctly

2. **Custom Domain (Optional)**:
   - In Vercel dashboard, go to "Settings" > "Domains"
   - Add your custom domain

3. **Set up Automatic Deployments**:
   - Vercel automatically deploys on git push to main branch
   - Configure branch protection if needed

## Troubleshooting

### Build Errors
- Check that all dependencies are properly installed
- Verify environment variables are set correctly
- Review build logs in Vercel dashboard

### Runtime Errors
- Check browser console for errors
- Verify smart contract addresses are correct
- Ensure RPC endpoints are accessible

### Performance Issues
- Monitor Core Web Vitals in Vercel Analytics
- Optimize images and assets
- Consider implementing caching strategies

## Security Notes

- Never commit `.env.local` or actual environment variable values
- Keep private keys secure
- Use environment variables for all sensitive data
- Regularly rotate API keys and access tokens

## Support

If you encounter issues:
1. Check Vercel documentation
2. Review build and function logs
3. Test locally with `npm run build` and `npm run start`
4. Contact the development team

---

**Remember**: Always test your deployment in a preview environment before promoting to production!

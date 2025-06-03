# Vercel Deployment Guide

This guide will help you deploy the Cauliflower Website to Vercel.

## Prerequisites

1. Make sure you have the Vercel CLI installed:
   ```
   npm install -g vercel
   ```

2. Make sure you're logged in to Vercel:
   ```
   vercel login
   ```

## Deployment Steps

### Option 1: Using the Deployment Script

The easiest way to deploy is to use the provided deployment script:

1. Run the deployment script:
   ```
   deploy-vercel.bat
   ```

2. Choose whether you want a preview deployment or a production deployment.

This script will build your application locally to verify everything works, then deploy it to Vercel.

### Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

1. For a preview deployment:
   ```
   npm run vercel-deploy
   ```

2. For a production deployment:
   ```
   npm run vercel-deploy-prod
   ```

## Troubleshooting

If you encounter any issues during deployment:

### Permission Issues

The build scripts have been enhanced to handle permission issues automatically. If you still encounter permission problems:

1. Make sure the build scripts are executable:
   ```
   chmod +x node_modules/.bin/vite
   chmod +x node_modules/vite/bin/vite.js
   ```

2. Try running the build locally first:
   ```
   npm run build
   ```

### Build Failures

If the build fails on Vercel:

1. Check the Vercel deployment logs for specific error messages
2. Try deploying with the `--debug` flag:
   ```
   vercel --debug
   ```

3. Make sure your project is compatible with Vercel's build environment:
   - Node.js version
   - Dependencies
   - Build configuration

## Vercel Configuration

The Vercel configuration is located in `vercel.json`. This file includes:

- Routing rules
- Build commands
- Output directory
- Headers for caching
- Framework specification

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [Troubleshooting Vercel Deployments](https://vercel.com/guides/troubleshooting-vercel-deployments)
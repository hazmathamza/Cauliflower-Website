// Custom build script for Vercel that doesn't rely on the Vite CLI
import { build } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running custom Vercel build script...');

async function runBuild() {
  try {
    console.log('Starting Vite build using API...');
    
    // Use the Vite API directly instead of the CLI
    await build({
      root: __dirname,
      configFile: path.resolve(__dirname, 'vite.vercel.config.js'),
      mode: 'production',
      logLevel: 'info'
    });
    
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
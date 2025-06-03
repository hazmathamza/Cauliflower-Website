// Simple build script for Vercel
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { build } from 'vite';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Set environment variable to indicate we're in Vercel
process.env.VERCEL = 'true';

console.log('Running Vercel build script...');

// Determine which config file to use
const vercelConfigPath = resolve(__dirname, 'vite.config.vercel.js');
const configFile = fs.existsSync(vercelConfigPath) ? vercelConfigPath : undefined;

async function runBuild() {
  try {
    console.log('Running Vite build using API...');
    console.log(`Using config file: ${configFile || 'default vite.config.js'}`);
    
    // Run Vite build using the API instead of CLI
    await build({
      configFile,
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
// Simple build script for Vercel
import { build } from 'vite';

console.log('Running build script...');

async function runBuild() {
  try {
    console.log('Running Vite build...');
    
    // Run Vite build
    await build({
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
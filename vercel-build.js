// This script is used to fix permissions during the Vercel build process
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running Vercel build script...');

// Set environment variable to indicate we're in a Vercel build
process.env.VERCEL = 'true';

try {
  // Make sure vite is executable
  const vitePath = path.join(process.cwd(), 'node_modules', '.bin', 'vite');
  if (fs.existsSync(vitePath)) {
    try {
      fs.chmodSync(vitePath, '755');
      console.log('Set permissions for vite executable');
    } catch (err) {
      console.warn('Could not set permissions for vite executable:', err.message);
    }
  } else {
    console.warn('Vite executable not found at:', vitePath);
  }

  // Run the build command with the simplified Vercel config
  console.log('Running build command with Vercel config...');
  execSync('npx vite build --config vite.config.vercel.js', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
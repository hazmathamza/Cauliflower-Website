// Simple build script for Vercel
import { execSync } from 'child_process';

console.log('Running Vercel build script...');

try {
  // Run the build command using npx
  console.log('Executing build command...');
  execSync('npx vite build --config vite.vercel.config.js', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
// Simple build script for Vercel
import { execSync } from 'child_process';

console.log('Running simplified Vercel build script...');

try {
  // Run the build command directly
  console.log('Executing build command...');
  execSync('npx vite build --config vite.config.vercel.simple.js', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
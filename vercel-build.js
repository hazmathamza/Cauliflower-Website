// Simple build script for Vercel
const { execSync } = require('child_process');

console.log('Running Vercel build script...');

try {
  // Run the build command
  console.log('Running build command...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
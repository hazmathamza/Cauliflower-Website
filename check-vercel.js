// Script to check if Vercel deployment is working correctly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Checking Vercel deployment configuration...');

// Check if required files exist
const requiredFiles = [
  'vercel.json',
  'package.json',
  'vite.config.js',
  'build.mjs',
  'vercel-build.js'
];

const missingFiles = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.error('Missing required files:', missingFiles.join(', '));
  process.exit(1);
}

// Check package.json for required scripts
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
const requiredScripts = ['build', 'vercel-build'];

const missingScripts = [];
for (const script of requiredScripts) {
  if (!packageJson.scripts[script]) {
    missingScripts.push(script);
  }
}

if (missingScripts.length > 0) {
  console.error('Missing required scripts in package.json:', missingScripts.join(', '));
  process.exit(1);
}

// Check vercel.json configuration
const vercelJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
if (!vercelJson.rewrites || !vercelJson.buildCommand) {
  console.error('vercel.json is missing required configuration');
  process.exit(1);
}

// Check if vite is installed
try {
  execSync('npx --no-install vite --version', { stdio: 'pipe' });
  console.log('Vite is installed and accessible');
} catch (error) {
  console.error('Vite is not properly installed or accessible');
  process.exit(1);
}

console.log('All checks passed! Your Vercel deployment configuration looks good.');
console.log('To deploy to Vercel, run: npm run vercel-deploy');
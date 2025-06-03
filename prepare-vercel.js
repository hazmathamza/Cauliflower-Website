// Script to prepare for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Preparing for Vercel deployment...');

// Backup the original package.json
try {
  fs.copyFileSync(
    path.join(__dirname, 'package.json'),
    path.join(__dirname, 'package.original.json')
  );
  console.log('Backed up original package.json');
} catch (error) {
  console.warn('Could not backup package.json:', error.message);
}

// Copy the Vercel-specific package.json
try {
  fs.copyFileSync(
    path.join(__dirname, 'package.vercel.json'),
    path.join(__dirname, 'package.json')
  );
  console.log('Copied Vercel-specific package.json');
} catch (error) {
  console.warn('Could not copy Vercel package.json:', error.message);
}

console.log('Preparation completed');
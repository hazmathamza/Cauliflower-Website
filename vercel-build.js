// Enhanced build script for Vercel with permission handling
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import fs from 'fs';
import { build } from 'vite';
import { execSync } from 'child_process';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

// Set environment variable to indicate we're in Vercel
process.env.VERCEL = 'true';
process.env.NODE_ENV = 'production';

console.log('Running enhanced Vercel build script...');

// Function to safely make a file executable
const makeExecutable = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const newMode = stats.mode | 0o111; // Add executable bit for user, group, and others
      fs.chmodSync(filePath, newMode);
      console.log(`Made ${filePath} executable`);
      return true;
    }
  } catch (error) {
    console.warn(`Could not make ${filePath} executable:`, error.message);
  }
  return false;
};

// Make node_modules binaries executable
const binPaths = [
  join(__dirname, 'node_modules', '.bin'),
  join(__dirname, 'node_modules', 'vite', 'bin')
];

for (const binPath of binPaths) {
  try {
    if (fs.existsSync(binPath)) {
      const files = fs.readdirSync(binPath);
      for (const file of files) {
        makeExecutable(join(binPath, file));
      }
    }
  } catch (error) {
    console.warn(`Error processing bin directory ${binPath}:`, error.message);
  }
}

// Determine which config file to use
const vercelConfigPath = resolve(__dirname, 'vite.config.vercel.js');
const configFile = fs.existsSync(vercelConfigPath) ? vercelConfigPath : undefined;

// Create a temporary copy of useTheme.js as useTheme.jsx if it doesn't exist
const useThemeJsPath = resolve(__dirname, 'src', 'hooks', 'useTheme.js');
const useThemeJsxPath = resolve(__dirname, 'src', 'hooks', 'useTheme.jsx');

if (fs.existsSync(useThemeJsPath) && !fs.existsSync(useThemeJsxPath)) {
  try {
    console.log('Creating JSX version of useTheme.js for Vercel compatibility...');
    fs.copyFileSync(useThemeJsPath, useThemeJsxPath);
    console.log('Successfully created useTheme.jsx');
  } catch (error) {
    console.warn('Failed to create useTheme.jsx:', error.message);
  }
}

async function runBuild() {
  try {
    console.log('Running Vite build using API...');
    console.log(`Using config file: ${configFile || 'default vite.config.js'}`);
    
    try {
      // Run Vite build using the API instead of CLI
      await build({
        configFile,
        mode: 'production',
        logLevel: 'info'
      });
      
      console.log('Build completed successfully using Vite API');
    } catch (apiError) {
      console.warn('Vite API build failed, trying CLI approach:', apiError.message);
      
      // Fallback to CLI approach
      try {
        execSync('npx --no-install vite build', { 
          stdio: 'inherit',
          env: { ...process.env, NODE_ENV: 'production' }
        });
        console.log('Build completed successfully using CLI');
      } catch (cliError) {
        throw new Error(`Both API and CLI build methods failed. Last error: ${cliError.message}`);
      }
    }
  } catch (error) {
    console.error('Build failed:', error);
    
    // Create a fallback build if everything else fails
    try {
      console.log('Creating fallback build...');
      const distDir = resolve(__dirname, 'dist');
      
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      const fallbackHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cauliflower Chat</title>
  <style>
    body { font-family: system-ui; background: #1e1e2e; color: white; text-align: center; padding: 2rem; }
    h1 { color: #7289da; }
    .container { max-width: 600px; margin: 0 auto; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cauliflower Chat</h1>
    <p>Our application is being updated. Please check back soon!</p>
  </div>
</body>
</html>`;
      
      fs.writeFileSync(join(distDir, 'index.html'), fallbackHtml);
      console.log('Fallback build created successfully');
    } catch (fallbackError) {
      console.error('Even fallback build failed:', fallbackError);
    }
    
    process.exit(1);
  }
}

runBuild();
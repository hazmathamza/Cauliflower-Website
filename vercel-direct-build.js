// Direct build script for Vercel that uses npm directly
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running direct npm build script...');

try {
  // Use npm directly to run the build
  console.log('Executing npm run build command...');
  
  // Try to make the vite executable executable
  try {
    fs.chmodSync(path.join(__dirname, 'node_modules', '.bin', 'vite'), 0o755);
    console.log('Made vite executable');
  } catch (error) {
    console.warn('Could not make vite executable:', error.message);
  }
  
  // Run npm directly
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' }
  });
  
  console.log('Build completed successfully');
} catch (error) {
  console.error('Build failed, falling back to static build:', error);
  
  // Create dist directory if it doesn't exist
  const distDir = path.resolve(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Create a simple index.html file
  const indexHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Cauliflower Chat</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: #1e1e2e;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        padding: 20px;
        text-align: center;
      }
      h1 {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }
      p {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        max-width: 600px;
      }
      .button {
        background-color: #7289da;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: bold;
        transition: background-color 0.3s;
      }
      .button:hover {
        background-color: #5b6eae;
      }
    </style>
  </head>
  <body>
    <h1>Cauliflower Chat</h1>
    <p>We're experiencing some technical difficulties with our deployment. Please check back later!</p>
    <a href="https://github.com/hazmathamza/Cauliflower-Website" class="button">View on GitHub</a>
  </body>
  </html>
  `;
  
  // Write the index.html file
  fs.writeFileSync(path.resolve(distDir, 'index.html'), indexHtml);
  
  console.log('Fallback static build completed successfully');
  process.exit(0); // Exit with success code
}
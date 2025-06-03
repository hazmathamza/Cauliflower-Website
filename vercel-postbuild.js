// This script runs after the build to ensure everything is set up correctly
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running post-build script...');

// Ensure the dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist!');
  process.exit(1);
}

// Create a _redirects file for SPA routing
const redirectsPath = path.join(distDir, '_redirects');
fs.writeFileSync(redirectsPath, '/* /index.html 200');
console.log('Created _redirects file for SPA routing');

// Create a simple server.js file for Node.js environments
const serverPath = path.join(distDir, 'server.js');
const serverContent = `
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});
`;
fs.writeFileSync(serverPath, serverContent);
console.log('Created server.js file for Node.js environments');

console.log('Post-build completed successfully');
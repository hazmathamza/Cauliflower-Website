// Pre-build script for Vercel deployment
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running Vercel pre-build script...');

// Function to ensure a file exists with JSX extension
const ensureJsxFile = (jsFilePath) => {
  const dirName = path.dirname(jsFilePath);
  const baseName = path.basename(jsFilePath, '.js');
  const jsxFilePath = path.join(dirName, `${baseName}.jsx`);
  
  if (fs.existsSync(jsFilePath) && !fs.existsSync(jsxFilePath)) {
    try {
      console.log(`Creating JSX version of ${jsFilePath}...`);
      fs.copyFileSync(jsFilePath, jsxFilePath);
      console.log(`Successfully created ${jsxFilePath}`);
      return true;
    } catch (error) {
      console.warn(`Failed to create ${jsxFilePath}:`, error.message);
      return false;
    }
  }
  return false;
};

// List of JS files that contain JSX and need to be duplicated as JSX files
const jsFilesWithJsx = [
  path.join(__dirname, 'src', 'hooks', 'useTheme.js'),
  // Add more files here if needed
];

// Process each file
let processedCount = 0;
for (const filePath of jsFilesWithJsx) {
  if (ensureJsxFile(filePath)) {
    processedCount++;
  }
}

console.log(`Pre-build completed: ${processedCount} files processed`);
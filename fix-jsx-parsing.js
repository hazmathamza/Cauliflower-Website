// Script to fix JSX parsing issues in .js files
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Running JSX parsing fix script...');

// Function to convert a JS file with JSX to a non-JSX version
const convertJsxToJs = (filePath) => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return false;
  }

  try {
    // Read the file content
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Create a modified version that uses React.createElement instead of JSX
    const modifiedContent = content
      // Replace JSX Provider with React.createElement
      .replace(
        /<ThemeContext.Provider value={{ currentTheme, theme, toggleTheme, themes }}>\s*{children}\s*<\/ThemeContext.Provider>/g,
        'React.createElement(ThemeContext.Provider, { value: { currentTheme, theme, toggleTheme, themes } }, children)'
      );
    
    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent);
    console.log(`Successfully fixed JSX in ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error fixing JSX in ${filePath}:`, error);
    return false;
  }
};

// List of files to fix
const filesToFix = [
  path.join(__dirname, 'src', 'hooks', 'useTheme.js'),
  // Add more files here if needed
];

// Process each file
let fixedCount = 0;
for (const filePath of filesToFix) {
  if (convertJsxToJs(filePath)) {
    fixedCount++;
  }
}

console.log(`JSX parsing fix completed: ${fixedCount} files fixed`);
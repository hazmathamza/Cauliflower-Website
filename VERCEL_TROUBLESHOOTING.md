# Vercel Deployment Troubleshooting

This guide helps you troubleshoot common issues when deploying to Vercel.

## JSX Parsing Error

If you encounter a JSX parsing error like this:

```
[vite:build-import-analysis] Parse error @:129:29
file: /vercel/path0/src/hooks/useTheme.js:129:28
127: <ThemeContext.Provider value={{ currentTheme, theme, toggleTheme, themes }}>
128: {children}
129: </ThemeContext.Provider>
```

### Solution 1: Use the Fix Script

Run the JSX fix script before deploying:

```
npm run fix-jsx
```

This script converts JSX syntax in .js files to use `React.createElement()` instead, which avoids the parsing issue.

### Solution 2: Rename Files to .jsx

Rename any .js files that contain JSX to have a .jsx extension:

1. Rename `src/hooks/useTheme.js` to `src/hooks/useTheme.jsx`
2. Update any imports if necessary (though with path aliases this is usually not needed)

### Solution 3: Update Vite Configuration

Make sure your Vite configuration is set up to handle JSX in .js files:

```js
// vite.config.js
export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files
      include: "**/*.{jsx,js}",
    }),
  ],
  // ...other config
});
```

## Build Failures

If the build fails on Vercel:

1. Run the test build script locally:
   ```
   test-build.bat
   ```

2. Check the Vercel logs for specific error messages

3. Make sure all dependencies are properly installed:
   ```
   npm install
   ```

## Permission Issues

If you encounter permission issues:

1. The build scripts automatically attempt to fix permissions
2. If issues persist, try deploying with the Vercel CLI:
   ```
   npm run vercel-deploy
   ```

## Other Issues

For other deployment issues:

1. Check the Vercel deployment logs
2. Try deploying with debug mode:
   ```
   vercel --debug
   ```
3. Make sure your project is compatible with Vercel's Node.js version
// This file is used to configure the Vercel build process
export default {
  // Set this to true to indicate we're in a Vercel build environment
  isVercel: true,
  
  // Configure the build process
  build: {
    // Use the vercel-build script
    command: 'npm run vercel-build',
    
    // Output directory
    outputDirectory: 'dist',
    
    // Environment variables
    env: {
      VERCEL: 'true',
      NODE_ENV: 'production'
    }
  }
};
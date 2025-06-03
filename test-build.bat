@echo off
echo ===== Testing Vercel Build Process Locally =====
echo.

echo Step 1: Running JSX fix script...
call node fix-jsx-parsing.js
if %ERRORLEVEL% NEQ 0 (
  echo JSX fix script failed!
  exit /b %ERRORLEVEL%
)
echo JSX fix script completed successfully.
echo.

echo Step 2: Running Vercel build script...
call node vercel-build.js
if %ERRORLEVEL% NEQ 0 (
  echo Vercel build script failed!
  exit /b %ERRORLEVEL%
)
echo Vercel build script completed successfully.
echo.

echo ===== Build test completed successfully! =====
echo Your application should now build correctly on Vercel.
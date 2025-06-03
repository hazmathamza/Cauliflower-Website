@echo off
echo ===== Cauliflower Website Vercel Deployment =====
echo.

echo Step 1: Checking Vercel configuration...
call npm run check-vercel
if %ERRORLEVEL% NEQ 0 (
  echo Vercel configuration check failed! Please fix the issues before deploying.
  exit /b %ERRORLEVEL%
)
echo Vercel configuration check passed.
echo.

echo Step 2: Building the application locally to verify...
call npm run build
if %ERRORLEVEL% NEQ 0 (
  echo Local build failed! Please fix the issues before deploying.
  exit /b %ERRORLEVEL%
)
echo Local build completed successfully.
echo.

echo Step 3: Deploying to Vercel...
echo Choose deployment type:
echo 1. Preview deployment (default)
echo 2. Production deployment
echo.
set /p deployType="Enter your choice (1 or 2): "

if "%deployType%"=="2" (
  echo Deploying to production...
  call npm run vercel-deploy-prod
) else (
  echo Creating preview deployment...
  call npm run vercel-deploy
)

if %ERRORLEVEL% NEQ 0 (
  echo Deployment failed!
  exit /b %ERRORLEVEL%
)
echo.
echo ===== Deployment completed successfully! =====
echo Your application is now live on Vercel.
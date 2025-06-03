@echo off
echo Starting Discord Clone Application...

echo Creating data directory for backend...
mkdir backend\data 2>nul

echo Starting backend server...
start cmd /k "cd backend && python app.py"

echo Starting frontend development server...
start cmd /k "npm run dev"

echo Application started!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173

echo Press any key to exit...
pause > nul
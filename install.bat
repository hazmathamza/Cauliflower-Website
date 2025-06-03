@echo off
echo Installing Discord Clone dependencies...

echo Installing frontend dependencies...
call npm install

echo Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo All dependencies installed!
echo Run start.bat to start the application.

echo Press any key to exit...
pause > nul
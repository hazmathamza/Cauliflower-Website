@echo off
echo Applying modifications to Discord Clone...

echo Backing up original files...
copy src\App.jsx src\App.jsx.bak
copy src\components\AuthScreen.jsx src\components\AuthScreen.jsx.bak

echo Applying modified files...
copy src\App.modified.jsx src\App.jsx
copy src\components\AuthScreen.modified.jsx src\components\AuthScreen.jsx

echo Modifications applied!
echo Run install.bat to install dependencies, then start.bat to start the application.

echo Press any key to exit...
pause > nul
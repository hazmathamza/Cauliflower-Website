@echo off
echo Applying Firebase modifications to Discord Clone...

echo Backing up original files...
copy src\App.jsx src\App.jsx.bak
copy src\components\AuthScreen.jsx src\components\AuthScreen.jsx.bak

echo Applying Firebase modified files...
copy src\App.firebase.jsx src\App.jsx
copy src\components\AuthScreen.firebase.jsx src\components\AuthScreen.jsx

echo Installing Firebase dependencies...
call npm install

echo Firebase modifications applied!
echo Please update the Firebase configuration in src\lib\firebase.js with your own Firebase project details.

echo Press any key to exit...
pause > nul
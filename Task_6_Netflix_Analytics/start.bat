@echo off
echo ====================================
echo  Netflix Analytics Engine - Startup
echo ====================================
echo.
echo [1/2] Starting Flask Backend on port 5006...
start "Flask Backend" cmd /k "cd /d %~dp0backend && python server.py"

timeout /t 3 /nobreak > nul

echo [2/2] Starting React Frontend on port 5176...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm run dev -- --port 5176"

echo.
echo Both servers started!
echo Backend: http://localhost:5006
echo Frontend: http://localhost:5176
echo.
pause

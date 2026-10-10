@echo off
title Auspify - Terminate All Microservices
echo ======================================================================
echo           AUSPIFY MACHINE LEARNING SUITE - STOPPING ALL SERVERS
echo ======================================================================
echo.

set PORTS=5003 5004 5005 5006 5173 5174 5175 5176

for %%P in (%PORTS%) do (
    echo Freeing Port %%P...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%P ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo ======================================================================
echo   ALL 8 BACKEND AND FRONTEND SERVERS HAVE BEEN TERMINATED!
echo ======================================================================
pause

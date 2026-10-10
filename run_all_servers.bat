@echo off
title Auspify - Launch All Microservices
echo ======================================================================
echo           AUSPIFY MACHINE LEARNING SUITE - LAUNCHING ALL SERVERS
echo ======================================================================
echo.

cd /d "%~dp0"

echo [1/8] Starting Task 3 Backend (Port 5003)...
start "Task 3 Backend [Port 5003]" cmd /k "cd /d "%~dp0Task_3_Audience_Rating_Classification\backend" && python run.py"

echo [2/8] Starting Task 3 Frontend (Port 5173)...
start "Task 3 Frontend [Port 5173]" cmd /k "cd /d "%~dp0Task_3_Audience_Rating_Classification\frontend" && npm run dev -- --port 5173"

echo [3/8] Starting Task 4 Backend (Port 5004)...
start "Task 4 Backend [Port 5004]" cmd /k "cd /d "%~dp0Task_4_Netflix_Content_Segmentation\backend" && python server.py"

echo [4/8] Starting Task 4 Frontend (Port 5174)...
start "Task 4 Frontend [Port 5174]" cmd /k "cd /d "%~dp0Task_4_Netflix_Content_Segmentation\frontend-react" && npm run dev -- --port 5174"

echo [5/8] Starting Task 5 Backend (Port 5005)...
start "Task 5 Backend [Port 5005]" cmd /k "cd /d "%~dp0Task_5_Netflix_Trend_Forecasting_Model\backend" && python app.py"

echo [6/8] Starting Task 5 Frontend (Port 5175)...
start "Task 5 Frontend [Port 5175]" cmd /k "cd /d "%~dp0Task_5_Netflix_Trend_Forecasting_Model\frontend" && npm run dev -- --port 5175"

echo [7/8] Starting Task 6 Backend (Port 5006)...
start "Task 6 Backend [Port 5006]" cmd /k "cd /d "%~dp0Task_6_Netflix_Analytics\backend" && python server.py"

echo [8/8] Starting Task 6 Frontend (Port 5176)...
start "Task 6 Frontend [Port 5176]" cmd /k "cd /d "%~dp0Task_6_Netflix_Analytics\frontend" && npm run dev -- --port 5176"

echo.
echo ======================================================================
echo   ALL 8 SERVERS HAVE BEEN LAUNCHED IN SEPARATE TERMINAL WINDOWS!
echo ======================================================================
echo.
echo   Task 3 UI: http://localhost:5173  (API: http://localhost:5003)
echo   Task 4 UI: http://localhost:5174  (API: http://localhost:5004)
echo   Task 5 UI: http://localhost:5175  (API: http://localhost:5005)
echo   Task 6 UI: http://localhost:5176  (API: http://localhost:5006)
echo.
echo To shut down all servers at once, run: stop_all_servers.bat
echo ======================================================================

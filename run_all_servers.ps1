# PowerShell Script to Launch All 8 Servers in Independent Windows
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "          AUSPIFY MACHINE LEARNING SUITE - LAUNCHING ALL SERVERS" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot

Write-Host "`n[1/8] Starting Task 3 Backend (Port 5003)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_3_Audience_Rating_Classification\backend`" && python run.py"

Write-Host "[2/8] Starting Task 3 Frontend (Port 5173)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_3_Audience_Rating_Classification\frontend`" && npm run dev -- --port 5173"

Write-Host "`n[3/8] Starting Task 4 Backend (Port 5004)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_4_Netflix_Content_Segmentation\backend`" && python server.py"

Write-Host "[4/8] Starting Task 4 Frontend (Port 5174)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_4_Netflix_Content_Segmentation\frontend-react`" && npm run dev -- --port 5174"

Write-Host "`n[5/8] Starting Task 5 Backend (Port 5005)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_5_Netflix_Trend_Forecasting_Model\backend`" && python app.py"

Write-Host "[6/8] Starting Task 5 Frontend (Port 5175)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_5_Netflix_Trend_Forecasting_Model\frontend`" && npm run dev -- --port 5175"

Write-Host "`n[7/8] Starting Task 6 Backend (Port 5006)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_6_Netflix_Analytics\backend`" && python server.py"

Write-Host "[8/8] Starting Task 6 Frontend (Port 5176)..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k cd /d `"$root\Task_6_Netflix_Analytics\frontend`" && npm run dev -- --port 5176"

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host "  ALL 8 SERVERS HAVE BEEN LAUNCHED!" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "  Task 3 UI: http://localhost:5173" -ForegroundColor White
Write-Host "  Task 4 UI: http://localhost:5174" -ForegroundColor White
Write-Host "  Task 5 UI: http://localhost:5175" -ForegroundColor White
Write-Host "  Task 6 UI: http://localhost:5176" -ForegroundColor White
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "To stop all servers at once, run: .\stop_all_servers.bat`n" -ForegroundColor Cyan

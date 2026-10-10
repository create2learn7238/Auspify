@echo off
echo Starting Netflix Trend Forecasting Project...

echo [1/2] Starting Flask Backend...
start cmd /k "cd backend && python app.py"

echo [2/2] Starting React Frontend on port 5175...
start cmd /k "cd frontend && npm run dev -- --port 5175"

echo Both servers are starting. You can view the frontend at http://localhost:5175

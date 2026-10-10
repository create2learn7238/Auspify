Write-Host "Starting Netflix Audience Rating Classifier..."
Write-Host "============================================="

# Start Flask Backend in the background
Write-Host "Starting Python Flask API on http://127.0.0.1:5003..."
Set-Location -Path "backend"
Start-Process -NoNewWindow -FilePath "python" -ArgumentList "run.py"
Set-Location -Path ".."

# Wait a couple of seconds for the backend to initialize
Start-Sleep -Seconds 2

# Start React Frontend
Write-Host "Starting React Frontend..."
Set-Location -Path "frontend"
npm run dev

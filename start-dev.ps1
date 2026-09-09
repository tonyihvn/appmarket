# AppsHub Development Startup Script
# Starts both backend and frontend servers in separate windows

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $rootDir "backend"
$frontendDir = Join-Path $rootDir "frontend"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Starting AppsHub Development Servers" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if directories exist
if (-not (Test-Path $backendDir)) {
    Write-Host "Error: Backend directory not found at $backendDir" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendDir)) {
    Write-Host "Error: Frontend directory not found at $frontendDir" -ForegroundColor Red
    exit 1
}

# Start backend server in a new window
Write-Host "Starting Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$backendDir'; npm run dev" -WindowStyle Normal -PassThru
Write-Host "Backend Server started (PID: $($backendProcess.Id))" -ForegroundColor Green

# Give backend a moment to start
Start-Sleep -Seconds 2

# Start frontend server in a new window
Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
$frontendProcess = Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$frontendDir'; npm run dev" -WindowStyle Normal -PassThru
Write-Host "Frontend Server started (PID: $($frontendProcess.Id))" -ForegroundColor Green

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Both servers are running!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend: http://localhost:5000 (or your configured port)" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173 (or your configured port)" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the servers, close the windows or press Ctrl+C in each window." -ForegroundColor Yellow
Write-Host ""

# Keep this window open and monitor processes
Write-Host "Main process running... (Close this window to end monitoring)" -ForegroundColor Gray
$backendProcess.WaitForExit()

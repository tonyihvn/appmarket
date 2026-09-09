@echo off
REM AppsHub Development Startup Script - Batch Version
REM Starts both backend and frontend servers in separate windows

setlocal enabledelayedexpansion

set "rootDir=%~dp0"
set "backendDir=%rootDir%backend"
set "frontendDir=%rootDir%frontend"

echo.
echo ================================
echo Starting AppsHub Development Servers
echo ================================
echo.

REM Check if directories exist
if not exist "%backendDir%" (
    echo Error: Backend directory not found at %backendDir%
    pause
    exit /b 1
)

if not exist "%frontendDir%" (
    echo Error: Frontend directory not found at %frontendDir%
    pause
    exit /b 1
)

REM Start backend server
echo Starting Backend Server...
start "AppsHub Backend" cmd /k "cd /d "%backendDir%" && npm run dev"
timeout /t 2 /nobreak

REM Start frontend server
echo Starting Frontend Server...
start "AppsHub Frontend" cmd /k "cd /d "%frontendDir%" && npm run dev"

echo.
echo ================================
echo Both servers are running!
echo ================================
echo.
echo Backend: http://localhost:5000 (or your configured port)
echo Frontend: http://localhost:5173 (or your configured port)
echo.
echo To stop the servers, close each window or press Ctrl+C.
echo.
pause

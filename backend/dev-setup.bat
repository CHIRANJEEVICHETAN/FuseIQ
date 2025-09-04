@echo off
REM EvolveSync Backend Development Setup Script
REM This script sets up the local development environment on Windows

echo 🚀 Setting up EvolveSync Backend Development Environment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Check if Docker Compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose and try again.
    pause
    exit /b 1
)

REM Install npm dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing npm dependencies...
    npm install
)

REM Start Docker services
echo 🐳 Starting Docker services (PostgreSQL, Redis, pgAdmin, Redis Commander)...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak >nul

echo 🎉 Development environment is ready!
echo.
echo 📋 Available services:
echo    • PostgreSQL: localhost:5432 (postgres/postgres123)
echo    • Redis: localhost:6379
echo    • pgAdmin: http://localhost:8080 (admin@evolve-sync.com/admin123)
echo    • Redis Commander: http://localhost:8081
echo.
echo 🛠️  Next steps:
echo    1. Run 'npm run dev' to start the development server
echo    2. Or run 'npm run dev:full' to start everything together
echo.
echo 📚 Useful commands:
echo    • npm run docker:logs - View service logs
echo    • npm run docker:down - Stop services
echo    • npm run docker:clean - Reset everything
echo.
pause
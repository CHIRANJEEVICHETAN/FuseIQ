#!/bin/bash

# EvolveSync Backend Development Setup Script
# This script sets up the local development environment

echo "🚀 Setting up EvolveSync Backend Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Install npm dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL, Redis, pgAdmin, Redis Commander)..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if PostgreSQL is ready
echo "🔍 Checking PostgreSQL connection..."
until docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done
echo "✅ PostgreSQL is ready!"

# Check if Redis is ready
echo "🔍 Checking Redis connection..."
until docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; do
    echo "   Waiting for Redis..."
    sleep 2
done
echo "✅ Redis is ready!"

echo ""
echo "🎉 Development environment is ready!"
echo ""
echo "📋 Available services:"
echo "   • PostgreSQL: localhost:5432 (postgres/postgres123)"
echo "   • Redis: localhost:6379"
echo "   • pgAdmin: http://localhost:8080 (admin@evolve-sync.com/admin123)"
echo "   • Redis Commander: http://localhost:8081"
echo ""
echo "🛠️  Next steps:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Or run 'npm run dev:full' to start everything together"
echo ""
echo "📚 Useful commands:"
echo "   • npm run docker:logs - View service logs"
echo "   • npm run docker:down - Stop services"
echo "   • npm run docker:clean - Reset everything"
echo ""
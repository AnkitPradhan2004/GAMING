#!/bin/bash

# AURA Gaming Server Deployment Script
# This script helps deploy the server to production

set -e

echo "🚀 AURA Gaming Server Deployment Script"
echo "========================================"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js v18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Run syntax check
echo "🔍 Running syntax check..."
node -c server.js
echo "✅ Syntax check passed"

# Run health check script
echo "🏥 Testing health check..."
node healthcheck.js
echo "✅ Health check passed"

# Install PM2 if not already installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

echo "✅ PM2 is available: $(pm2 -v)"

# Stop existing PM2 process if running
echo "🛑 Stopping existing PM2 processes..."
pm2 stop ecosystem.config.js 2>/dev/null || true
pm2 delete ecosystem.config.js 2>/dev/null || true

# Start with PM2
echo "🚀 Starting server with PM2..."
npm run pm2:start

# Wait a moment for startup
sleep 3

# Check if process is running
if pm2 list | grep -q "aura-gaming-server"; then
    echo "✅ Server started successfully!"
    echo ""
    echo "📊 PM2 Status:"
    pm2 list
    echo ""
    echo "📋 Useful commands:"
    echo "  View logs: npm run pm2:logs"
    echo "  Monitor: npm run pm2:monit"
    echo "  Restart: npm run pm2:restart"
    echo "  Stop: npm run pm2:stop"
    echo ""
    echo "🌐 Health check: curl http://localhost:3000/health"
else
    echo "❌ Failed to start server"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"
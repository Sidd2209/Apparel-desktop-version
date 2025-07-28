#!/bin/bash

# Apparel Flow Desktop - Launch Script
echo "🚀 Launching Apparel Flow Desktop..."

# Kill any existing backend processes
pkill -f "node.*server" 2>/dev/null || true

# Start the app
npm run start:electron

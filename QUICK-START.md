# Apparel Flow Desktop - Quick Start Guide

## 🚀 Quick Launch
```bash
./launch-app.sh
```

## 🐛 Debug Mode
```bash
./debug-app.sh
```

## 📁 Project Structure
- `src/` - Frontend React code
- `server/` - Backend GraphQL server
- `dist/` - Built application files
- `electron-main.ts` - Electron main process

## 🔧 Development Commands
```bash
# Install dependencies
npm install
cd server && npm install && cd ..

# Build everything
npm run build
cd server && npm run build && cd ..
npm run build:electron-main

# Start development
npm run start:electron
```

## 🌐 Backend API
- GraphQL: http://localhost:8080/graphql
- Health Check: http://localhost:8080/health

## 📝 Troubleshooting
1. If you get 404 errors, restart the app
2. If backend doesn't connect, check if port 8080 is free
3. If Prisma errors occur, run: `cd server && npx prisma generate && cd ..`

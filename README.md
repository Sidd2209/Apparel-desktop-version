# Apparel Flow Desktop

A completely offline desktop application for apparel manufacturing management, built with Electron, React, and SQLite.

## Features

- **Completely Offline**: No internet connection required
- **Order Management**: Track orders, customers, and production status
- **Product Development**: Manage product designs, samples, and specifications
- **Costing Calculator**: Calculate production costs with detailed breakdowns
- **Production Planning**: Schedule and track production plans
- **Inventory Management**: Monitor stock levels and reorder points
- **Resource Management**: Track equipment and worker allocation

## Technology Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Express + GraphQL + Prisma
- **Database**: SQLite (embedded, no external dependencies)
- **Desktop**: Electron
- **UI Components**: Radix UI + Shadcn/ui

## Quick Start

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev:electron
   ```

This will:
- Build the Electron main process
- Build the backend server
- Build the React frontend
- Start the Electron app

### Production Build

1. **Build the application**:
   ```bash
   npm run build:backend
   npm run build
   npm run dist
   ```

2. **Find the installer**:
   - macOS: `dist/Apparel Flow Desktop-1.0.0-arm64.dmg`
   - Windows: `dist/Apparel Flow Desktop Setup 1.0.0.exe`
   - Linux: `dist/Apparel Flow Desktop-1.0.0.AppImage`

## Database

The app uses SQLite with Prisma ORM. The database file is located at:
- Development: `server/prisma/dev.db`
- Production: Embedded in the app bundle

### Sample Data

The app comes with sample data including:
- Sample users (admin and designer accounts)
- Sample products (T-shirts, jeans)
- Sample orders with customer information
- Sample inventory items (fabrics, materials)
- Sample costing sheets with detailed breakdowns
- Sample production plans and resources

## Architecture

### Frontend (React)
- Located in `src/`
- Uses React Router for navigation
- Apollo Client for GraphQL communication
- Tailwind CSS for styling

### Backend (Express + GraphQL)
- Located in `server/src/`
- GraphQL API with Apollo Server
- Prisma for database operations
- SQLite database

### Electron
- Main process: `electron-main.ts` (compiled to `electron-main.cjs`)
- Loads the React app from `dist/`
- Starts the backend server on port 8080
- Handles app lifecycle and window management

## API Endpoints

- **GraphQL**: `http://localhost:8080/graphql`
- **Health Check**: `http://localhost:8080/health`
- **API Info**: `http://localhost:8080/`

## Development Scripts

- `npm run dev`: Start Vite dev server
- `npm run build`: Build React app
- `npm run build:backend`: Build backend and initialize database
- `npm run build:electron-main`: Build Electron main process
- `npm run dev:electron`: Full development build and start
- `npm run dist`: Create production installer

## Database Schema

The app includes models for:
- **Users**: Authentication and user management
- **Products**: Product specifications and development stages
- **Orders**: Customer orders and production tracking
- **Samples**: Product samples and feedback
- **Design Files**: Product design files and versions
- **Costing Sheets**: Detailed cost calculations
- **Production Plans**: Production scheduling
- **Resources**: Equipment and worker management
- **Inventory**: Stock management and tracking

## Offline Capabilities

- **No Internet Required**: All functionality works offline
- **Local Database**: SQLite database embedded in the app
- **Self-Contained**: All dependencies bundled with the app
- **Data Persistence**: All data stored locally on the user's machine

## Security

- **Local Only**: No external network communication
- **No Authentication**: Simplified for offline use
- **Data Privacy**: All data stays on the user's machine

## Troubleshooting

### Backend Not Starting
- Check if port 8080 is available
- Ensure all dependencies are installed: `npm install`
- Check the console for error messages

### Database Issues
- The database is automatically initialized on first run
- Database file: `server/prisma/dev.db`
- Reset database: Delete the `.db` file and restart

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Rebuild backend: `npm run build:backend`
- Check TypeScript compilation: `npm run build:electron-main`

## License

This project is for internal use only.

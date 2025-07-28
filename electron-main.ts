import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as http from 'http';
import * as url from 'url';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;
let frontendServer: http.Server | null = null;
let isStartingUp = false;

// Check if port is already in use
function isPortOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once('error', () => resolve(true)) // already in use
      .once('listening', function () {
        tester.close(() => resolve(false)); // free
      })
      .listen(port);
  });
}

// Start a simple HTTP server to serve the frontend
function startFrontendServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    // Find an available port starting from 3000
    let port = 3000;
    
    const tryPort = (testPort: number): void => {
      isPortOpen(testPort).then((inUse) => {
        if (inUse) {
          tryPort(testPort + 1);
        } else {
          port = testPort;
          startServer();
        }
      });
    };
    
    const startServer = (): void => {
      // Since electron-main.js is in the dist folder, the HTML and assets are in the same directory
      const distPath = __dirname;
      
      frontendServer = http.createServer((req, res) => {
        if (!req.url) {
          res.writeHead(400);
          res.end('Bad Request');
          return;
        }
        
        const parsedUrl = url.parse(req.url);
        let filePath = parsedUrl.pathname || '/';
        
        // Handle root path and client-side routing
        if (filePath === '/') {
          filePath = '/index.html';
        }
        
        // Remove leading slash for file system
        const fullPath = path.join(distPath, filePath);
        
        console.log('🔍 Request:', req.url);
        console.log('🔍 File path:', filePath);
        console.log('🔍 Full path:', fullPath);
        console.log('🔍 File exists:', fs.existsSync(fullPath));
        
        // Check if file exists
        if (!fs.existsSync(fullPath)) {
          // For client-side routing, serve index.html for all non-file requests
          if (!path.extname(filePath)) {
            const indexPath = path.join(distPath, 'index.html');
            if (fs.existsSync(indexPath)) {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(fs.readFileSync(indexPath));
              return;
            }
          }
          
          res.writeHead(404);
          res.end('Not Found');
          return;
        }
        
        // Serve static files
        const ext = path.extname(fullPath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
          '.ico': 'image/x-icon',
        }[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(fs.readFileSync(fullPath));
      });
      
      frontendServer.listen(port, () => {
        console.log(`🌐 Frontend server started on port ${port}`);
        console.log(`📁 Serving from: ${distPath}`);
        resolve(port);
      });
      
      frontendServer.on('error', (error) => {
        console.error('❌ Frontend server error:', error);
        reject(error);
      });
    };
    
    tryPort(port);
  });
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running, quitting...');
  app.quit();
  process.exit(0);
} else {
  app.on('second-instance', () => {
    console.log('Second instance detected, focusing existing window...');
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
    },
    show: false,
  });

  // Load the frontend from the HTTP server
  mainWindow.loadURL(`http://localhost:3000`);

  // Add error handling for window load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Failed to load window:', {
      errorCode,
      errorDescription,
      validatedURL
    });
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Window loaded successfully');
  });

  mainWindow.once('ready-to-show', () => {
    console.log('✅ Window ready to show');
    mainWindow?.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

function startBackend(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Check if backend is already running
    const portInUse = await isPortOpen(8080);
    if (portInUse) {
      console.log('⚠️ Backend already running on port 8080');
      return resolve();
    }
    
    let serverDir: string;
    let backendPath: string;
    
    const isPackaged = __dirname.includes('app.asar');
    
    if (isPackaged) {
      serverDir = path.join(__dirname, '..', 'app.asar.unpacked', 'server');
      backendPath = path.join(serverDir, 'dist', 'index.js');
    } else {
      // When running from dist folder, go up one level to find server
      serverDir = path.join(__dirname, '..', 'server');
      backendPath = path.join(serverDir, 'dist', 'index.js');
    }
    
    // Ensure the paths are absolute
    serverDir = path.resolve(serverDir);
    backendPath = path.resolve(backendPath);
    
    console.log('🔍 Backend path:', backendPath);
    console.log('📂 Backend exists:', fs.existsSync(backendPath));
    
    if (!fs.existsSync(backendPath)) {
      reject(new Error(`Backend not found at ${backendPath}`));
      return;
    }
    
    const env = { 
      ...process.env, 
      PORT: '8080', 
      NODE_ENV: 'production', 
      START_SERVER: 'true' 
    };
    
    console.log('🚀 Starting backend...');
    console.log('🔧 Using node to spawn backend');
    console.log('📁 Working directory:', serverDir);
    console.log('🔧 Environment:', env);
    
    backendProcess = spawn('node', [backendPath], {
      cwd: serverDir,
      env: env,
      stdio: 'pipe'
    });

    let backendStarted = false;
    const timeout = setTimeout(() => {
      if (!backendStarted) {
        backendProcess?.kill();
        reject(new Error('Backend startup timeout'));
      }
    }, 15000);

    backendProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      console.log('Backend:', output);
      
      if (output.includes('Server ready') || output.includes('Server ready at')) {
        backendStarted = true;
        clearTimeout(timeout);
        resolve();
      }
    });

    backendProcess.stderr?.on('data', (data) => {
      console.error('Backend error:', data.toString());
    });

    backendProcess.on('error', (error) => {
      console.error('Backend process error:', error);
      clearTimeout(timeout);
      reject(error);
    });

    backendProcess.on('exit', (code) => {
      console.log('Backend process exited with code:', code);
      if (!backendStarted) {
        clearTimeout(timeout);
        reject(new Error(`Backend process exited with code ${code}`));
      }
    });
  });
}

app.on('ready', async () => {
  // Prevent multiple startup attempts
  if (isStartingUp) {
    console.log('🚫 App is already starting up, skipping...');
    return;
  }
  
  try {
    isStartingUp = true;
    console.log('🚀 Starting Apparel Flow Desktop App...');
    
    // Start frontend server first
    await startFrontendServer();
    console.log('✅ Frontend server started successfully');
    
    await startBackend();
    console.log('✅ Backend started successfully');
    
    createWindow();
    isStartingUp = false;
  } catch (err: any) {
    isStartingUp = false;
    console.error('❌ Failed to start app:', err);
    
    // Only show error window if we don't already have one
    if (!mainWindow) {
      const errorWindow = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        },
        title: 'Apparel Flow - Error',
        show: false,
      });

      errorWindow.once('ready-to-show', () => {
        errorWindow.show();
      });

      errorWindow.loadURL(`data:text/html,
        <html>
          <head>
            <title>Apparel Flow - Error</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; text-align: center; }
              .error { color: #dc2626; margin: 20px 0; }
              .info { color: #6b7280; margin: 10px 0; }
              button { background: #3b82f6; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; }
            </style>
          </head>
          <body>
            <h1>Apparel Flow Desktop</h1>
            <div class="error">
              <h2>Failed to start application</h2>
              <p>${err.message}</p>
            </div>
            <div class="info">
              <p>Please check the console for more details.</p>
              <p>Make sure no other application is using port 8080 or 3000.</p>
            </div>
            <button onclick="window.close()">Close</button>
          </body>
        </html>
      `);
    }
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('🛑 App is quitting, cleaning up...');
  if (backendProcess) {
    console.log('🛑 Stopping backend process...');
    backendProcess.kill();
  }
  if (frontendServer) {
    console.log('🛑 Stopping frontend server...');
    frontendServer.close();
  }
  isStartingUp = false;
});

app.on('activate', () => {
  // Only create window if it doesn't exist and we're not in the middle of startup
  if (mainWindow === null && !isStartingUp) {
    createWindow();
  }
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  app.quit();
}); 
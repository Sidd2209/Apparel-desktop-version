const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Testing backend startup...');

const serverDir = path.join(__dirname, 'server');
const backendPath = path.join(serverDir, 'dist', 'index.js');

console.log('📂 Server directory:', serverDir);
console.log('📂 Backend path:', backendPath);

const backendProcess = spawn('node', [backendPath], {
  cwd: serverDir,
  env: { ...process.env, PORT: '8080', NODE_ENV: 'production', START_SERVER: 'true' },
  stdio: 'pipe'
});

let backendStarted = false;
const timeout = setTimeout(() => {
  if (!backendStarted) {
    console.log('❌ Backend startup timeout');
    backendProcess.kill();
    process.exit(1);
  }
}, 10000);

backendProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log('Backend:', output);
  
  if (output.includes('Server ready') || output.includes('Server ready at')) {
    backendStarted = true;
    clearTimeout(timeout);
    console.log('✅ Backend started successfully!');
    
    // Test the health endpoint
    setTimeout(() => {
      const http = require('http');
      const req = http.get('http://localhost:8080/health', (res) => {
        console.log('✅ Health check passed:', res.statusCode);
        backendProcess.kill();
        process.exit(0);
      });
      
      req.on('error', (err) => {
        console.log('❌ Health check failed:', err.message);
        backendProcess.kill();
        process.exit(1);
      });
    }, 1000);
  }
});

backendProcess.stderr.on('data', (data) => {
  console.error('Backend error:', data.toString());
});

backendProcess.on('error', (error) => {
  console.error('Backend process error:', error);
  clearTimeout(timeout);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  console.log('Backend process exited with code:', code);
  if (!backendStarted) {
    clearTimeout(timeout);
    process.exit(1);
  }
}); 
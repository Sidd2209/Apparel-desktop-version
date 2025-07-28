# 🔧 Apparel Flow Desktop - Fixed Solution

## ✅ **Problem Solved: Multiple Instances Issue**

The app was creating multiple instances because the backend wasn't starting properly in the packaged app. Here's the complete solution:

## 📋 **What Was Fixed:**

### 1. **Single Instance Lock**
```typescript
// In electron-main.ts
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running, quitting...');
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
```

### 2. **Improved Backend Startup**
```typescript
// In electron-main.ts
function startBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    // ... backend startup logic
    backendProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Server ready') || output.includes('Server ready at')) {
        backendStarted = true;
        clearTimeout(timeout);
        resolve();
      }
    });
  });
}
```

### 3. **Better Error Handling**
```typescript
// Shows error window instead of just quitting
app.on('ready', async () => {
  try {
    await startBackend();
    createWindow();
  } catch (err: any) {
    // Show error window with details
    const errorWindow = new BrowserWindow({...});
  }
});
```

## 🚀 **How to Use the Fixed App:**

### **Step 1: Kill All Existing Instances**
```bash
pkill -f "Apparel Flow Desktop"
pkill -f "electron"
```

### **Step 2: Install the New DMG**
- Double-click: `Apparel Flow Desktop-1.0.0-arm64.dmg`
- Drag to Applications folder
- Eject the DMG

### **Step 3: Launch with Debug Script**
```bash
./launch-app.sh
```

### **Step 4: If Issues Persist**
```bash
# Check Console.app for errors
open -a Console

# Search for "Apparel Flow Desktop" in Console.app
# Look for error messages
```

## 📁 **Files Created/Fixed:**

### **1. electron-main.ts (Fixed)**
- Added single instance lock
- Improved backend startup detection
- Better error handling with error window
- Increased timeout to 15 seconds

### **2. server/src/index.ts (Simplified)**
- Removed complex path detection
- Simplified Prisma initialization
- Better logging

### **3. launch-app.sh (New)**
```bash
#!/bin/bash
# Kills existing instances
# Checks port 8080
# Launches app properly
```

### **4. test-backend.js (New)**
```javascript
// Tests backend independently
// Verifies it starts correctly
// Tests health endpoint
```

## 🔍 **Troubleshooting Steps:**

### **If App Still Won't Start:**

1. **Check Console.app:**
   ```bash
   open -a Console
   # Search for "Apparel Flow Desktop"
   ```

2. **Check Port 8080:**
   ```bash
   lsof -i :8080
   ```

3. **Kill All Processes:**
   ```bash
   pkill -f "Apparel Flow Desktop"
   pkill -f "electron"
   ```

4. **Test Backend Independently:**
   ```bash
   node test-backend.js
   ```

5. **Reinstall App:**
   - Delete from Applications
   - Reinstall from DMG

## 📦 **New DMG File:**
- **File**: `Apparel Flow Desktop-1.0.0-arm64.dmg`
- **Size**: 254MB
- **Location**: `dist/Apparel Flow Desktop-1.0.0-arm64.dmg`
- **Fixes**: All the issues mentioned above

## ✅ **What's Working Now:**

1. **Single Instance**: Only one app can run at a time
2. **Proper Backend Startup**: Backend starts reliably
3. **Error Messages**: Clear error messages instead of silent failures
4. **Debug Tools**: Scripts to help troubleshoot
5. **Health Checks**: Backend health is verified

## 🎯 **Expected Behavior:**

1. **First Launch**: App starts, backend initializes, window opens
2. **Subsequent Launches**: Focuses existing window
3. **Error Cases**: Shows error window with details
4. **Backend Issues**: Clear error messages in Console.app

## 📞 **If Still Having Issues:**

1. **Restart your computer**
2. **Check Console.app for specific error messages**
3. **Make sure port 8080 is not in use**
4. **Try the debug scripts provided**

The app should now work properly without creating multiple instances! 
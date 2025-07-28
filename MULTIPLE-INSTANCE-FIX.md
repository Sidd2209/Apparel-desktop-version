# 🔧 **MULTIPLE INSTANCE FIX - Apparel Flow Desktop**

## 🚨 **Problem Identified:**
The app was opening 50-60 instances and crashing due to recursive calls and improper instance management.

## ✅ **Root Causes Fixed:**

### 1. **Recursive `app.on('activate')` Calls**
**Problem**: The `activate` event was creating new windows without checking if the app was already starting up.

**Fix**:
```typescript
// Before
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow(); // Could cause recursive calls
  }
});

// After
app.on('activate', () => {
  if (mainWindow === null && !isStartingUp) {
    createWindow(); // Only if not already starting
  }
});
```

### 2. **Multiple Startup Attempts**
**Problem**: The `ready` event could be triggered multiple times.

**Fix**:
```typescript
// Added startup guard
if (isStartingUp) {
  console.log('🚫 App is already starting up, skipping...');
  return;
}
```

### 3. **Insufficient Single Instance Lock**
**Problem**: The app wasn't properly exiting when another instance was detected.

**Fix**:
```typescript
if (!gotTheLock) {
  console.log('Another instance is already running, quitting...');
  app.quit();
  process.exit(0); // Force exit
}
```

### 4. **Error Window Recursion**
**Problem**: Error windows could trigger additional app instances.

**Fix**:
```typescript
// Only show error window if we don't already have one
if (!mainWindow) {
  const errorWindow = new BrowserWindow({
    // ... configuration
    show: false, // Don't show immediately
  });
  
  errorWindow.once('ready-to-show', () => {
    errorWindow.show(); // Show only when ready
  });
}
```

### 5. **Missing Cleanup**
**Problem**: Startup flags weren't being reset properly.

**Fix**:
```typescript
app.on('before-quit', () => {
  console.log('🛑 App is quitting, cleaning up...');
  if (backendProcess) {
    backendProcess.kill();
  }
  isStartingUp = false; // Reset startup flag
});
```

## 🛡️ **Protection Mechanisms Added:**

### 1. **Startup Guard**
```typescript
let isStartingUp = false;

app.on('ready', async () => {
  if (isStartingUp) {
    console.log('🚫 App is already starting up, skipping...');
    return;
  }
  // ... rest of startup logic
});
```

### 2. **Enhanced Single Instance Lock**
```typescript
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log('Another instance is already running, quitting...');
  app.quit();
  process.exit(0); // Force exit
}
```

### 3. **Safe Window Creation**
```typescript
app.on('activate', () => {
  if (mainWindow === null && !isStartingUp) {
    createWindow();
  }
});
```

### 4. **Proper Error Handling**
```typescript
} catch (err: any) {
  isStartingUp = false; // Reset flag on error
  // ... error handling
}
```

## 🎯 **Expected Behavior Now:**

1. **First Launch**: 
   - App starts normally
   - Single instance lock prevents duplicates
   - Startup guard prevents recursive calls

2. **Second Launch Attempt**:
   - Detects existing instance
   - Focuses existing window
   - No new instances created

3. **Error Cases**:
   - Shows error window only if no main window exists
   - Proper cleanup of startup flags
   - No recursive error handling

4. **App Quit**:
   - Properly kills backend process
   - Resets all flags
   - Clean shutdown

## ✅ **Testing the Fix:**

```bash
# Kill any existing instances
pkill -f "Apparel Flow Desktop"

# Start the app
npm run start:electron

# Try to start another instance (should focus existing window)
npm run start:electron
```

## 📊 **Results:**
- ✅ **No Multiple Instances**: Only one app can run at a time
- ✅ **No Recursive Calls**: Startup guard prevents recursion
- ✅ **Proper Cleanup**: All processes and flags reset correctly
- ✅ **Error Recovery**: Graceful error handling without recursion
- ✅ **Single Instance Lock**: Robust instance management

The app should now start cleanly without creating multiple instances or crashing! 
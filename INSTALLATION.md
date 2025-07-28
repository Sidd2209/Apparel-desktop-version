# Apparel Flow Desktop - Installation Guide

## 📦 Download and Install

### For macOS Users:

1. **Download the DMG file:**
   - File: `Apparel Flow Desktop-1.0.0-arm64.dmg`
   - Size: ~254MB
   - Location: `dist/Apparel Flow Desktop-1.0.0-arm64.dmg`

2. **Install the application:**
   - Double-click the DMG file
   - Drag "Apparel Flow Desktop" to your Applications folder
   - Eject the DMG

3. **First Launch:**
   - Go to Applications folder
   - Right-click on "Apparel Flow Desktop"
   - Select "Open" (macOS may warn about unidentified developer)
   - Click "Open" in the security dialog

### For Windows Users:

1. **Download the EXE file:**
   - File: `Apparel Flow Desktop Setup 1.0.0.exe`
   - Run the installer as administrator

### For Linux Users:

1. **Download the AppImage file:**
   - File: `Apparel Flow Desktop-1.0.0.AppImage`
   - Make it executable: `chmod +x Apparel Flow Desktop-1.0.0.AppImage`
   - Run: `./Apparel Flow Desktop-1.0.0.AppImage`

## 🚀 Using the App

### First Time Setup:

1. **Launch the app** - It will start automatically
2. **Login** - Use any email/password combination (demo mode)
3. **Demo Login** - Click "Demo Login" for instant access

### Features Available:

- **Order Management** - Track orders and customers
- **Product Development** - Manage product designs
- **Costing Calculator** - Calculate production costs
- **Production Planning** - Schedule production
- **Inventory Management** - Track stock levels
- **Resource Management** - Manage equipment and workers

### Sample Data Included:

- Sample users (Admin, Designer)
- Sample products (T-shirts, Jeans)
- Sample orders with customer information
- Sample inventory items (fabrics, materials)
- Sample costing sheets with detailed breakdowns
- Sample production plans and resources

## 🔧 Troubleshooting

### App Won't Start or Multiple Instances:

**If the app creates multiple instances or won't start:**

1. **Kill all instances:**
   ```bash
   pkill -f "Apparel Flow Desktop"
   ```

2. **Check port 8080:**
   ```bash
   lsof -i :8080
   ```
   If something is using port 8080, stop that application first.

3. **Use the debug script:**
   ```bash
   ./debug-app.sh
   ```

4. **Check Console.app for errors:**
   - Open Console.app (Applications > Utilities > Console)
   - Search for "Apparel Flow Desktop"
   - Look for error messages

5. **Restart your computer** and try again

### App Won't Start:

1. **Check system requirements:**
   - macOS 10.14+ (for macOS version)
   - Windows 10+ (for Windows version)
   - Linux with AppImage support (for Linux version)

2. **Security settings:**
   - macOS: Go to System Preferences > Security & Privacy
   - Allow "Apparel Flow Desktop" to run

3. **Port conflicts:**
   - The app uses port 8080 for the backend
   - Make sure no other application is using this port
   - Run: `lsof -i :8080` to check

4. **Clear app data:**
   - Delete: `~/Library/Application Support/Apparel Flow Desktop`
   - Restart the app

### Database Issues:

- The app includes a SQLite database with sample data
- All data is stored locally on your machine
- No internet connection required

### Performance Issues:

- Close other applications to free up memory
- The app includes a complete backend server
- First launch may take a few seconds to start the backend

### Common Error Messages:

**"Backend did not start in time":**
- Check if port 8080 is in use
- Restart your computer
- Try the debug script

**"Another instance is already running":**
- Kill all instances: `pkill -f "Apparel Flow Desktop"`
- Wait a few seconds and try again

**"Failed to connect to backend":**
- The backend server didn't start properly
- Check Console.app for backend errors
- Restart your computer

## 📋 System Requirements

- **Operating System:** macOS 10.14+, Windows 10+, or Linux
- **Memory:** 4GB RAM minimum, 8GB recommended
- **Storage:** 500MB free space
- **Network:** No internet connection required (completely offline)

## 🔒 Security

- **Completely Offline:** No internet connection required
- **Local Data:** All data stored on your machine
- **No Authentication:** Simplified for offline use
- **No Updates:** Static application, no automatic updates

## 🛠️ Debugging

If you're having issues:

1. **Run the debug script:**
   ```bash
   ./debug-app.sh
   ```

2. **Check Console.app:**
   - Open Console.app
   - Search for "Apparel Flow Desktop"
   - Look for error messages

3. **Check port usage:**
   ```bash
   lsof -i :8080
   ```

4. **Kill all instances:**
   ```bash
   pkill -f "Apparel Flow Desktop"
   ```

## 📞 Support

This is a standalone offline application. All data is stored locally and no external services are required.

## 🎯 Features

- **100% Offline** - Works without internet
- **Self-Contained** - No external dependencies
- **Complete Workflow** - From order to production
- **Professional UI** - Modern, intuitive interface
- **Sample Data** - Ready to use with demo data 
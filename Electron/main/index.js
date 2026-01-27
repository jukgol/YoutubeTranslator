const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const logManager = require('./js/logManager.js');

function createWindow () {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Initialize the logManager with the created window
  logManager.initialize(mainWindow);
}

app.whenReady().then(() => {
  createWindow();

  // Test log from the main process on startup
  logManager.write('Application started.');

  // Listener for logs coming from the renderer process
  ipcMain.on('log-from-renderer', (event, message) => {
    // Add a prefix to distinguish the source and send it back through the central logger
    logManager.write(`[UI] ${message}`);
  });

  ipcMain.on('close-app', () => {
    app.quit();
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

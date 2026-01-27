const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const logManager = require('./js/logManager.js');
const PathManager = require('./path_service/pathManager.js'); // Import PathManager class
const SettingService = require('./setting_service/settingService.js'); // Import SettingService class

let settingServiceInstance = null; // Declare a variable to hold the instance
let mainWindow; // Declare mainWindow as a module-level variable

function createWindow () {
  mainWindow = new BrowserWindow({ // Assign to the module-level mainWindow
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  // mainWindow.webContents.openDevTools(); // ADDED FOR DEBUGGING (REMOVED)
}

app.whenReady().then(() => {
  createWindow();
  logManager.initialize(mainWindow); // Initialize logManager here with the created window

  // Instantiate services AFTER app is ready
  const pathsInstance = new PathManager();
  settingServiceInstance = new SettingService(); // SettingService's constructor now instantiates PathManager

  // Load initial settings into appConfig in the main process
  settingServiceInstance.readApiKeys();
  settingServiceInstance.loadVersion();
  settingServiceInstance.loadRule();
  logManager.write('Backend settings initialized.');

  // Test log from the main process on startup
  logManager.write('Application started.');

  // IPC Handlers for SettingService
  ipcMain.handle('setting:read-api-keys', () => {
    return settingServiceInstance.readApiKeys();
  });
  ipcMain.handle('setting:get-reordered-keys', (event, selected) => {
    return settingServiceInstance.getReorderedKeys(selected);
  });
  ipcMain.handle('setting:get-added-keys', (event, newKey) => {
    return settingServiceInstance.getAddedKeys(newKey);
  });
  ipcMain.handle('setting:write-api-keys', (event, keys) => {
    return settingServiceInstance.writeApiKeys(keys);
  });
  ipcMain.handle('setting:save-version', (event, version) => {
    return settingServiceInstance.saveVersion(version);
  });
  ipcMain.handle('setting:load-version', () => {
    return settingServiceInstance.loadVersion();
  });
  ipcMain.handle('setting:save-rule', (event, rule) => {
    return settingServiceInstance.saveRule(rule);
  });
  ipcMain.handle('setting:load-rule', () => {
    return settingServiceInstance.loadRule();
  });

  // Listener for logs coming from the renderer process
  ipcMain.on('log-from-renderer', (event, message) => {
    // Add a prefix to distinguish the source and send it back through the central logger
    logManager.write(`[UI] ${message}`);
  });

  // Listener for renderer's readiness to receive logs
  ipcMain.on('renderer-ready-for-logs', () => {
    logManager.setRendererReady(); // Inform logManager that renderer is ready
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

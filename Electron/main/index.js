const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const logManager = require('./js/logManager.js');
const PathManager = require('./path_service/pathManager.js'); // Import PathManager class
const SettingService = require('./setting_service/settingService.js'); // Import SettingService class
const pathService = require('./path_service/pathService.js'); // Import pathService

// Import IPC handlers
const { registerSettingHandlers } = require('./ipc/settingHandlers.js');
const { registerPathHandlers } = require('./ipc/pathHandlers.js');
const { registerAppHandlers } = require('./ipc/appHandlers.js');

let settingServiceInstance = null; // Declare a variable to hold the instance
let mainWindow; // Declare mainWindow as a module-level variable

function createWindow () {
  mainWindow = new BrowserWindow({ // Assign to the module-level mainWindow
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  // mainWindow.webContents.openDevTools(); // ADDED FOR DEBUGGING (REMOVED)
}

app.whenReady().then(() => { 

  // Instantiate services AFTER app is ready
  // const pathsInstance = new PathManager(); // PathManager is instantiated within SettingService
  settingServiceInstance = new SettingService(); // SettingService's constructor now instantiates PathManager

  // Load initial settings into appConfig in the main process
  logManager.write('Backend settings initialized.');

  // Test log from the main process on startup
  logManager.write('Application started.');

  // Register IPC handlers
  registerSettingHandlers(ipcMain, settingServiceInstance);
  registerPathHandlers(ipcMain, settingServiceInstance, pathService);
  registerAppHandlers(ipcMain, app, logManager);

  createWindow(); // This creates mainWindow and loads renderer/index.html

  // Initialize the logManager with the created mainWindow after it's available
  logManager.initialize(mainWindow);

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
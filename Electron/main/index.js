const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const logManager = require('./js/logManager.js');
const appEnv = require('./appEnv/appEnv'); // Import the AppEnv singleton

// Import IPC handlers
const { registerSettingHandlers } = require('./ipc/settingHandlers.js');
const { registerPathHandlers } = require('./ipc/pathHandlers.js');
const { registerAppHandlers } = require('./ipc/appHandlers.js');
const { registerUrlHandlers } = require('./ipc/urlHandlers.js');
const { setupProcessHandlers } = require('./ipc/processHandlers.js');
const { setupFsHandlers } = require('./ipc/fsHandlers.js'); // Add this line
const { cleanupPythonProcesses } = require('./ipc/pythonProcessManager.js'); // Updated
const { setupPythonSubtitleHandlers } = require('./ipc/pythonSubtitleHandlers.js'); // New
const { setupPythonDownloadHandlers } = require('./ipc/pythonDownloadHandlers.js'); // New
const { urlManager } = require('./download/urlManager.js'); // 새로 추가: urlManager 인스턴스 가져오기

let mainWindow; // Declare mainWindow as a module-level variable

function createWindow() {
  mainWindow = new BrowserWindow({ // Assign to the module-level mainWindow
    width: 1200,
    height: 800,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  // mainWindow.webContents.openDevTools(); // ADDED FOR DEBUGGING (REMOVED)
}

app.whenReady().then(async () => {

  logManager.write('Application started.');

  // Register IPC handlers
  registerSettingHandlers(ipcMain, appEnv.configFunc);
  registerPathHandlers(ipcMain, appEnv.configFunc);
  registerAppHandlers(ipcMain, app, logManager);
  registerUrlHandlers(ipcMain); // 수정: urlManager 인자 제거
  setupProcessHandlers();
  setupFsHandlers(); // Add this line
  setupPythonSubtitleHandlers(); // Updated
  setupPythonDownloadHandlers(); // Updated

  createWindow();
  logManager.initialize(mainWindow);
  urlManager.setMainWindow(mainWindow); // 새로 추가: mainWindow 주입

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.exit(0);
});

// Cleanup processes on app quit
app.on('will-quit', () => {
  cleanupPythonProcesses();
});
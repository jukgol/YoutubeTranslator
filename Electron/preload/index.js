const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // System functions
  closeApp: () => ipcRenderer.send('close-app'),

  // Logging functions
  // Send a log message from renderer to main
  log: (message) => ipcRenderer.send('log-from-renderer', message),
  
  // Listen for log messages from main
  onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, value) => callback(value))
});

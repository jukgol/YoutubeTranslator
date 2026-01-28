const { urlManager } = require('../../main/download/urlManager');

// Electron/main/ipc/appHandlers.js

module.exports = {
  registerAppHandlers: (ipcMain, app, logManager) => {
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

    ipcMain.handle('system:start-test-counter', async () => {
      urlManager.startTestCounter();
      return true; // Or some other success indicator
    });
  }
};

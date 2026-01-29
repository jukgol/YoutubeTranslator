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
      console.log('--- Electron: app.exit(0) is being called ---');
      app.exit(0);
    });

    ipcMain.handle('system:start-test-counter', async () => {
      urlManager.startTestCounter();
      return true; // Or some other success indicator
    });

    // urlManager Handlers
    ipcMain.handle('urlManager:add-url', async (event, url) => {
        const item = urlManager.addUrl(url);
        return item;
    });

    ipcMain.handle('urlManager:remove-url', async (event, url) => {
        const removed = urlManager.removeUrl(url);
        return removed;
    });

    ipcMain.handle('urlManager:fetch-url-title', async (event, url) => {
        const title = await urlManager.fetchUrlTitle(url);
        return title;
    });

    ipcMain.handle('urlManager:get-next', async () => {
        const item = urlManager.getNext();
        return item;
    });
  }
};

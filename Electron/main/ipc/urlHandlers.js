// Electron/main/ipc/urlHandlers.js

const { urlManager } = require('../download/urlManager');
const log = require('../js/logManager');

module.exports = {
  registerUrlHandlers: (ipcMain) => { // urlManager 인자 제거
    ipcMain.handle('system:start-test-counter', async () => {
      urlManager.startTestCounter();
      return true;
    });

    ipcMain.handle('urlManager:add-url', async (event, url) => {
      const item = urlManager.addUrl(url);
      return item;
    });

    ipcMain.handle('urlManager:remove-url', async (event, url) => {
      const removed = urlManager.removeUrl(url);
      return removed;
    });

    ipcMain.handle('urlManager:clear-url-list', async () => {
      const result = urlManager.clearUrlList();
      return result;
    });

    ipcMain.handle('urlManager:fetch-url-title', async (event, url) => {
      const title = await urlManager.fetchUrlTitle(url);
      return title;
    });

    ipcMain.handle('urlManager:get-next', async () => {
      const item = urlManager.getNext();
      return item;
    });

    ipcMain.handle('urlManager:clear-completed', async () => {
      const success = urlManager.clearCompleted();
      return success;
    });

    ipcMain.handle('url:start-download', async (event, quality) => {
      log.write(`[IPC] Received url:start-download call. Quality: ${quality}`);
      await urlManager.startDownload(quality);
      return true; // Signal completion
    });
  }
};
// Electron/main/ipc/urlHandlers.js

const { urlManager } = require('../download/urlManager'); // urlManager 인스턴스 가져오기 (다시 추가)

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
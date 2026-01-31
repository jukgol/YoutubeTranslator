const logManager = require('../js/logManager.js');

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
              console.log('[Main] 프로그램이 정상적으로 종료되었습니다.');      app.quit();
    });
  }
};

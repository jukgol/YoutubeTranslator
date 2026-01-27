// Electron/main/ipc/pathHandlers.js

module.exports = {
  registerPathHandlers: (ipcMain, settingServiceInstance, pathService) => {
    ipcMain.handle('path:get-video-files', () => {
      return pathService.getFolderFiles(settingServiceInstance.path.videoDir, ['.mp4', '.mkv', '.webm', '.avi']);
    });
    ipcMain.handle('path:get-subtitle-files', () => {
      return pathService.getFolderFiles(settingServiceInstance.path.originDir, ['.srt', '.vtt']);
    });
  }
};

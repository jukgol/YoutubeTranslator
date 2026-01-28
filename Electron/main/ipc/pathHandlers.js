// Electron/main/ipc/pathHandlers.js
const path = require('path');

module.exports = {
  registerPathHandlers: (ipcMain, settingServiceInstance, pathService) => {
    ipcMain.handle('path:get-video-files', () => {
      return pathService.getFolderFiles(settingServiceInstance.path.videoDir, ['.mp4', '.mkv', '.webm', '.avi']);
    });
    ipcMain.handle('path:get-subtitle-files', () => {
      return pathService.getFolderFiles(settingServiceInstance.path.originDir, ['.srt', '.vtt']);
    });
    ipcMain.handle('path:get-split-files', async () => {
      const splitDir = settingServiceInstance.path.splitDir;
      const subdirectories = await pathService.getSubdirectories(splitDir);
      const result = {};
      for (const folder of subdirectories) {
        const fullFolderPath = path.join(splitDir, folder);
        result[folder] = await pathService.getFilesinDirectory(fullFolderPath, ['.txt']);
      }
      return result;
    });
    ipcMain.handle('path:get-translated-files', async () => {
      const translateDir = settingServiceInstance.path.translateDir;
      const subdirectories = await pathService.getSubdirectories(translateDir);
      const result = {};
      for (const folder of subdirectories) {
        const fullFolderPath = path.join(translateDir, folder);
        result[folder] = await pathService.getFilesinDirectory(fullFolderPath, ['.txt']);
      }
      return result;
    });
    ipcMain.handle('path:get-combine-files', async () => {
      const combineDir = settingServiceInstance.path.combineDir;
      const files = await pathService.getFolderFiles(combineDir, ['.txt']); // Use getFolderFiles for flat list
      return files;
    });
    ipcMain.handle('path:get-result-files', async () => {
      const resultFinalDir = settingServiceInstance.path.resultFinalDir;
      const files = await pathService.getFolderFiles(resultFinalDir, ['.srt']); // Changed to .srt
      return files;
    });
  }
};

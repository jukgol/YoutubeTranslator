const path = require('path');
const appEnv = require('../appEnv/appEnv'); // Import the AppEnv singleton

module.exports = {
  registerPathHandlers: (ipcMain, settingServiceInstance) => {
    ipcMain.handle('path:get-video-files', () => {
      return appEnv.pathFuncUtils.getFolderFiles(settingServiceInstance.path.videoDir, ['.mp4', '.mkv', '.webm', '.avi']);
    });
    ipcMain.handle('path:get-subtitle-files', () => {
      return appEnv.pathFuncUtils.getFolderFiles(settingServiceInstance.path.originDir, ['.srt', '.vtt']);
    });
    ipcMain.handle('path:get-split-files', async () => {
      const splitDir = settingServiceInstance.path.splitDir;
      const subdirectories = await appEnv.pathFuncUtils.getSubdirectories(splitDir);
      const result = {};
      for (const folder of subdirectories) {
        const fullFolderPath = path.join(splitDir, folder);
        result[folder] = await appEnv.pathFuncUtils.getFilesinDirectory(fullFolderPath, ['.txt']);
      }
      return result;
    });
    ipcMain.handle('path:get-translated-files', async () => {
      const translateDir = settingServiceInstance.path.translateDir;
      const subdirectories = await appEnv.pathFuncUtils.getSubdirectories(translateDir);
      const result = {};
      for (const folder of subdirectories) {
        const fullFolderPath = path.join(translateDir, folder);
        result[folder] = await appEnv.pathFuncUtils.getFilesinDirectory(fullFolderPath, ['.txt']);
      }
      return result;
    });
    ipcMain.handle('path:get-combine-files', async () => {
      const combineDir = settingServiceInstance.path.combineDir;
      const files = await appEnv.pathFuncUtils.getFolderFiles(combineDir, ['.txt']); // Use getFolderFiles for flat list
      return files;
    });
    ipcMain.handle('path:get-result-files', async () => {
      const resultFinalDir = settingServiceInstance.path.resultFinalDir;
      const files = await appEnv.pathFuncUtils.getFolderFiles(resultFinalDir, ['.srt']); // Changed to .srt
      return files;
    });
  }
};

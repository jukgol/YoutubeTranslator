const path = require('path');
const { shell } = require('electron'); // Import shell from electron
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
    // New IPC handler to get the app's video directory
    ipcMain.handle('path:get-app-video-directory', () => {
      return appEnv.pathData.videoDir;
    });
    // New IPC handler to get the app's origin directory
    ipcMain.handle('path:get-app-origin-directory', () => {
      return appEnv.pathData.originDir;
    });
    // New IPC handler to get the app's split directory
    ipcMain.handle('path:get-app-split-directory', () => {
      return appEnv.pathData.splitDir;
    });
    // New IPC handler to get the app's translate directory
    ipcMain.handle('path:get-app-translate-directory', () => {
      return appEnv.pathData.translateDir;
    });
    // New IPC handler to get the app's combine directory
    ipcMain.handle('path:get-app-combine-directory', () => {
      return appEnv.pathData.combineDir;
    });
    // New IPC handler to get the app's result directory
    ipcMain.handle('path:get-app-result-directory', () => {
      return appEnv.pathData.resultFinalDir;
    });
    // New IPC handler to open a path using shell.openPath
    ipcMain.handle('path:open-path', async (event, filePath) => {
      try {
        await shell.openPath(filePath);
        return { success: true };
      } catch (error) {
        console.error('Failed to open path:', filePath, error);
        return { success: false, error: error.message };
      }
    });

    // --- FilePath Data Handlers ---
    ipcMain.handle('path:get-filepath-data', () => {
      return appEnv.filePath.data;
    });

    ipcMain.handle('path:set-filepath-data', (event, newData) => {
      return appEnv.filePath.save(newData);
    });
  }
};

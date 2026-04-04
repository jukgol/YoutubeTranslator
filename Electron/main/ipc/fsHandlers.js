const { ipcMain } = require('electron');
const fs = require('fs-extra'); // Using fs-extra for copyFile, which handles non-existent destination directory
const path = require('path');

function setupFsHandlers() {
    ipcMain.handle('fs:copy-file', async (event, sourcePath, destinationPath) => {
        try {
            await fs.copy(sourcePath, destinationPath, { overwrite: true });
            return { success: true, message: `File copied successfully from ${sourcePath} to ${destinationPath}` };
        } catch (error) {
            console.error(`Error copying file: ${error.message}`);
            return { success: false, message: `Failed to copy file: ${error.message}` };
        }
    });

    ipcMain.handle('fs:empty-dir', async (event, dirPath) => {
        try {
            await fs.emptyDir(dirPath);
            return { success: true, message: `Directory cleared: ${dirPath}` };
        } catch (error) {
            console.error(`Error clearing directory: ${error.message}`);
            return { success: false, message: `Failed to clear directory: ${error.message}` };
        }
    });
}

module.exports = { setupFsHandlers };
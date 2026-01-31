module.exports = (ipcRenderer) => ({
  copyFile: (sourcePath, destinationPath) => ipcRenderer.invoke('fs:copy-file', sourcePath, destinationPath),
});
// Electron/preload/api/process.js

module.exports = (ipcRenderer) => ({
  runSplit: (filename) => ipcRenderer.invoke('process:run-split', filename),
  runCombine: (folderName) => ipcRenderer.invoke('process:run-combine', folderName),
});

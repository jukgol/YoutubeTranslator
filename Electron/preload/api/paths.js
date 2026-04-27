module.exports = (ipcRenderer) => ({
  getVideoFiles: () => ipcRenderer.invoke('path:get-video-files'),
  getSubtitleFiles: () => ipcRenderer.invoke('path:get-subtitle-files'),
  getSplitFiles: () => ipcRenderer.invoke('path:get-split-files'),
  getTranslatedFiles: () => ipcRenderer.invoke('path:get-translated-files'),
  getCombineFiles: () => ipcRenderer.invoke('path:get-combine-files'),
  getResultFiles: () => ipcRenderer.invoke('path:get-result-files'),
  getAppVideoDirectory: () => ipcRenderer.invoke('path:get-app-video-directory'),
  getAppOriginDirectory: () => ipcRenderer.invoke('path:get-app-origin-directory'),
  getAppSplitDirectory: () => ipcRenderer.invoke('path:get-app-split-directory'),
  getAppTranslateDirectory: () => ipcRenderer.invoke('path:get-app-translate-directory'),
  getAppCombineDirectory: () => ipcRenderer.invoke('path:get-app-combine-directory'),
  getAppResultDirectory: () => ipcRenderer.invoke('path:get-app-result-directory'),
  openPath: (path) => ipcRenderer.invoke('path:open-path', path),
  getFilepathData: () => ipcRenderer.invoke('path:get-filepath-data'),
  setFilepathData: (newData) => ipcRenderer.invoke('path:set-filepath-data', newData)
});
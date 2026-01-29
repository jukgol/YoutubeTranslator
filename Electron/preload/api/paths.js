module.exports = (ipcRenderer) => ({
  getVideoFiles: () => ipcRenderer.invoke('path:get-video-files'),
  getSubtitleFiles: () => ipcRenderer.invoke('path:get-subtitle-files'),
  getSplitFiles: () => ipcRenderer.invoke('path:get-split-files'),
  getTranslatedFiles: () => ipcRenderer.invoke('path:get-translated-files'),
  getCombineFiles: () => ipcRenderer.invoke('path:get-combine-files'),
  getResultFiles: () => ipcRenderer.invoke('path:get-result-files'),
});
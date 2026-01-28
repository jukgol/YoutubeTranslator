module.exports = (ipcRenderer) => ({
  pathGetVideoFiles: () => ipcRenderer.invoke('path:get-video-files'),
  pathGetSubtitleFiles: () => ipcRenderer.invoke('path:get-subtitle-files'),
  pathGetSplitFiles: () => ipcRenderer.invoke('path:get-split-files'),
  pathGetTranslatedFiles: () => ipcRenderer.invoke('path:get-translated-files'),
  pathGetCombineFiles: () => ipcRenderer.invoke('path:get-combine-files'),
  pathGetResultFiles: () => ipcRenderer.invoke('path:get-result-files'),
});
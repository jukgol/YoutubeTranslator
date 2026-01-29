// Electron/preload/api/urlManager.js

module.exports = (ipcRenderer) => ({
    urlManagerAddUrl: (url) => ipcRenderer.invoke('urlManager:add-url', url),
    urlManagerRemoveUrl: (url) => ipcRenderer.invoke('urlManager:remove-url', url),
    urlManagerFetchUrlTitle: (url) => ipcRenderer.invoke('urlManager:fetch-url-title', url),
    urlManagerGetNext: () => ipcRenderer.invoke('urlManager:get-next'),
});
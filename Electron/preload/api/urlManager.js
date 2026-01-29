// Electron/preload/api/urlManager.js

module.exports = (ipcRenderer) => ({
    addUrl: (url) => ipcRenderer.invoke('urlManager:add-url', url),
    removeUrl: (url) => ipcRenderer.invoke('urlManager:remove-url', url),
    fetchUrlTitle: (url) => ipcRenderer.invoke('urlManager:fetch-url-title', url),
    getNext: () => ipcRenderer.invoke('urlManager:get-next'),
});
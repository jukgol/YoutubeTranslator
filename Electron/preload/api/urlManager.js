// Electron/preload/api/urlManager.js

module.exports = (ipcRenderer) => ({
    addUrl: (url) => ipcRenderer.invoke('urlManager:add-url', url),
    removeUrl: (url) => ipcRenderer.invoke('urlManager:remove-url', url),
    clearUrlList: () => ipcRenderer.invoke('urlManager:clear-url-list'),
    fetchUrlTitle: (url) => ipcRenderer.invoke('urlManager:fetch-url-title', url),
    getNext: () => ipcRenderer.invoke('urlManager:get-next'),
    startDownload: (quality, downloadSubs) => ipcRenderer.invoke('url:start-download', quality, downloadSubs),
    startDownload: (quality, downloadSubs) => ipcRenderer.invoke('url:start-download', quality, downloadSubs),
    onUpdateItem: (callback) => ipcRenderer.on('urlManager:item-updated', (_event, itemData) => callback(itemData)),
    getDownloadSettings: () => ipcRenderer.invoke('settings:get-download'),
    saveDownloadSettings: (settings) => ipcRenderer.invoke('settings:save-download', settings),
});
module.exports = (ipcRenderer) => ({
  closeApp: () => ipcRenderer.send('close-app'),
  startTestCounter: () => ipcRenderer.invoke('system:start-test-counter'),
});
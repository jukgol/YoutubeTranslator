module.exports = (ipcRenderer) => ({
  closeApp: () => ipcRenderer.send('close-app'),
});
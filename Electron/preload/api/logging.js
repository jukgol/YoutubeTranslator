module.exports = (ipcRenderer) => ({
  log: (message) => ipcRenderer.send('log-from-renderer', message),
  onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, value) => callback(value)),
  rendererReadyForLogs: () => ipcRenderer.send('renderer-ready-for-logs'),
});
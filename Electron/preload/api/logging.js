module.exports = (ipcRenderer) => ({
  write: (message) => ipcRenderer.send('log-from-renderer', message), // log -> write
  onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, value) => callback(value)),
  rendererReadyForLogs: () => ipcRenderer.send('renderer-ready-for-logs'),
});
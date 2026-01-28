const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // System functions
  closeApp: () => ipcRenderer.send('close-app'),

  // Logging functions
  // Send a log message from renderer to main
  log: (message) => ipcRenderer.send('log-from-renderer', message),
  
  // Listen for log messages from main
  onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, value) => callback(value)),

  // Setting Service functions
  settingReadApiKeys: () => ipcRenderer.invoke('setting:read-api-keys'),
  settingGetReorderedKeys: (selected) => ipcRenderer.invoke('setting:get-reordered-keys', selected),
  settingGetAddedKeys: (newKey) => ipcRenderer.invoke('setting:get-added-keys', newKey),
  settingWriteApiKeys: (keys) => ipcRenderer.invoke('setting:write-api-keys', keys),
  settingSaveVersion: (version) => ipcRenderer.invoke('setting:save-version', version),
  settingLoadVersion: () => ipcRenderer.invoke('setting:load-version'),
  settingSaveRule: (rule) => ipcRenderer.invoke('setting:save-rule', rule),
  settingLoadRule: () => ipcRenderer.invoke('setting:load-rule'),

  // Renderer ready signal
  rendererReadyForLogs: () => ipcRenderer.send('renderer-ready-for-logs'),

  // Path Service functions
  pathGetVideoFiles: () => ipcRenderer.invoke('path:get-video-files'),
  pathGetSubtitleFiles: () => ipcRenderer.invoke('path:get-subtitle-files'),
  pathGetSplitFiles: () => ipcRenderer.invoke('path:get-split-files'),
  pathGetTranslatedFiles: () => ipcRenderer.invoke('path:get-translated-files'),
  pathGetCombineFiles: () => ipcRenderer.invoke('path:get-combine-files'),
  pathGetResultFiles: () => ipcRenderer.invoke('path:get-result-files'),
});

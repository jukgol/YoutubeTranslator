module.exports = (ipcRenderer) => ({
  settingReadApiKeys: () => ipcRenderer.invoke('setting:read-api-keys'),
  settingGetReorderedKeys: (selected) => ipcRenderer.invoke('setting:get-reordered-keys', selected),
  settingGetAddedKeys: (newKey) => ipcRenderer.invoke('setting:get-added-keys', newKey),
  settingWriteApiKeys: (keys) => ipcRenderer.invoke('setting:write-api-keys', keys),
  settingSaveVersion: (version) => ipcRenderer.invoke('setting:save-version', version),
  settingLoadVersion: () => ipcRenderer.invoke('setting:load-version'),
  settingSaveRule: (rule) => ipcRenderer.invoke('setting:save-rule', rule),
  settingLoadRule: () => ipcRenderer.invoke('setting:load-rule'),
});
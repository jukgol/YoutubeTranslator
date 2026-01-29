module.exports = (ipcRenderer) => ({
  readApiKeys: () => ipcRenderer.invoke('setting:read-api-keys'),
  getReorderedKeys: (selected) => ipcRenderer.invoke('setting:get-reordered-keys', selected),
  getAddedKeys: (newKey) => ipcRenderer.invoke('setting:get-added-keys', newKey),
  writeApiKeys: (keys) => ipcRenderer.invoke('setting:write-api-keys', keys),
  saveVersion: (version) => ipcRenderer.invoke('setting:save-version', version),
  loadVersion: () => ipcRenderer.invoke('setting:load-version'),
  saveRule: (rule) => ipcRenderer.invoke('setting:save-rule', rule),
  loadRule: () => ipcRenderer.invoke('setting:load-rule'),
});
// Electron/main/ipc/settingHandlers.js

module.exports = {
  registerSettingHandlers: (ipcMain, settingServiceInstance) => {
    ipcMain.handle('setting:read-api-keys', () => {
      return settingServiceInstance.readApiKeys();
    });
    ipcMain.handle('setting:get-reordered-keys', (event, selected) => {
      return settingServiceInstance.getReorderedKeys(selected);
    });
    ipcMain.handle('setting:get-added-keys', (event, newKey) => {
      return settingServiceInstance.getAddedKeys(newKey);
    });
    ipcMain.handle('setting:write-api-keys', (event, keys) => {
      return settingServiceInstance.writeApiKeys(keys);
    });
    ipcMain.handle('setting:save-version', (event, version) => {
      return settingServiceInstance.saveVersion(version);
    });
    ipcMain.handle('setting:load-version', () => {
      return settingServiceInstance.loadVersion();
    });
    ipcMain.handle('setting:save-rule', (event, rule) => {
      return settingServiceInstance.saveRule(rule);
    });
    ipcMain.handle('setting:load-rule', () => {
      return settingServiceInstance.loadRule();
    });
  }
};

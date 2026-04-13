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
    ipcMain.handle('setting:get-rule-files', () => {
      return settingServiceInstance.getRuleFiles();
    });
    ipcMain.handle('setting:read-rule-preset', (event, filename) => {
      return settingServiceInstance.readRulePreset(filename);
    });
    ipcMain.handle('setting:save-init-data', (event, presetName) => {
      return settingServiceInstance.saveInitData(presetName);
    });
    ipcMain.handle('setting:load-selected-rule-preset', () => {
      return settingServiceInstance.configData.selectedRulePreset;
    });
    ipcMain.handle('setting:create-rule-preset', (event, filename, content) => {
      return settingServiceInstance.createRulePreset(filename, content);
    });
    ipcMain.handle('setting:delete-rule-preset', (event, filename) => {
      return settingServiceInstance.deleteRulePreset(filename);
    });
  }
};

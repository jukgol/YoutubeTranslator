// electron/main/setting_service/settingService.js
const fs = require('fs');
const PathManager = require('../path_service/pathManager.js'); // Import PathManager class
const appConfig = require('../config/config.js');               // Import my ported appConfig

class SettingService {
    constructor() {
        this.path = new PathManager(); // Instantiate PathManager here
        this.readApiKeys();
        this.loadVersion();
        this.loadRule();
    }

    // Helper to read file content
    _readFile(filePath) {
        if (!fs.existsSync(filePath)) {
            return "";
        }
        return fs.readFileSync(filePath, "utf-8").trim();
    }

    // Helper to write file content
    _writeFile(filePath, content) {
        fs.writeFileSync(filePath, content, "utf-8");
    }

    readApiKeys() {
        const filePath = this.path.apiFile;
        if (!fs.existsSync(filePath)) {
            appConfig.apiKeys = [];
            appConfig.selectedApi = "";
            return [];
        }
        const content = this._readFile(filePath);
        const keys = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        appConfig.apiKeys = keys;
        appConfig.selectedApi = keys.length > 0 ? keys[0] : "";
        return keys;
    }

    writeApiKeys(keys) {
        const content = keys.join('\n');
        this._writeFile(this.path.apiFile, content);
        appConfig.apiKeys = keys;
    }

    saveVersion(version) {
        this._writeFile(this.path.geminiVerFile, version);
        appConfig.modelVersion = version;
    }

    loadVersion() {
        const version = this._readFile(this.path.geminiVerFile);
        appConfig.modelVersion = version;
        return version;
    }

    saveRule(rule) {
        this._writeFile(this.path.ruleFile, rule);
        appConfig.promptRule = rule;
    }

    loadRule() {
        const rule = this._readFile(this.path.ruleFile);
        appConfig.promptRule = rule;
        return rule;
    }

    getReorderedKeys(selected) {
        let keys = this.readApiKeys(); // Get current keys
        if (selected && keys.includes(selected)) {
            keys = keys.filter(key => key !== selected); // Remove existing
            keys.unshift(selected); // Add to front
        }
        this.writeApiKeys(keys); // Save changes
        appConfig.apiKeys = keys;
        appConfig.selectedApi = selected;
        return keys;
    }

    getAddedKeys(newKey) {
        let keys = this.readApiKeys(); // Get current keys
        if (newKey && !keys.includes(newKey)) {
            keys.unshift(newKey); // Add to front if new
        } else if (newKey && keys.includes(newKey)) {
            keys = keys.filter(key => key !== newKey); // Remove existing
            keys.unshift(newKey); // Move to front
        }
        this.writeApiKeys(keys); // Save changes
        appConfig.apiKeys = keys;
        appConfig.selectedApi = newKey;
        return keys;
    }
}

module.exports = SettingService;

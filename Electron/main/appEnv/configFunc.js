// Electron/main/appEnv/configFunc.js - Moved from setting_service/settingService.js
const fs = require('fs');

class ConfigFunc { // Renamed from SettingService
    constructor(appEnvInstance) { // Accept appEnv instance        
        this.path = appEnvInstance.pathData; // Access pathData from the appEnv instance
        this.configData = appEnvInstance.configData; // Direct access to configData
        this.readApiKeys();
        this.loadVersion();
        this.loadRule();
        this.readCookies(); // Load cookies on initialization
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

    readCookies() {
        if (this.configData.cookies) {
            return this.configData.cookies;
        }
        const filePath = this.path.cookieFile;
        const cookies = this._readFile(filePath);
        this.configData.cookies = cookies;
        return cookies;
    }

    writeCookies(cookies) {
        const filePath = this.path.cookieFile;
        this._writeFile(filePath, cookies);
        this.configData.cookies = cookies;
    }

    readApiKeys() {
        const filePath = this.path.apiFile;
        if (!fs.existsSync(filePath)) {
            this.configData.apiKeys = [];
            this.configData.selectedApi = "";
            return [];
        }
        const content = this._readFile(filePath);
        const keys = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        this.configData.apiKeys = keys;
        this.configData.selectedApi = keys.length > 0 ? keys[0] : "";
        return keys;
    }

    writeApiKeys(keys) {
        const content = keys.join('\n');
        this._writeFile(this.path.apiFile, content);
        this.configData.apiKeys = keys;
    }

    saveVersion(version) {
        this._writeFile(this.path.geminiVerFile, version);
        this.configData.modelVersion = version;
    }

    loadVersion() {
        const version = this._readFile(this.path.geminiVerFile);
        this.configData.modelVersion = version;
        return version;
    }

    saveRule(rule) {
        this._writeFile(this.path.ruleFile, rule);
        this.configData.promptRule = rule;
    }

    loadRule() {
        const rule = this._readFile(this.path.ruleFile);
        this.configData.promptRule = rule;
        return rule;
    }

    getReorderedKeys(selected) {
        let keys = this.readApiKeys(); // Get current keys
        if (selected && keys.includes(selected)) {
            keys = keys.filter(key => key !== selected); // Remove existing
            keys.unshift(selected); // Add to front
        }
        this.writeApiKeys(keys); // Save changes
        this.configData.apiKeys = keys;
        this.configData.selectedApi = selected;
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
        this.configData.apiKeys = keys;
        this.configData.selectedApi = newKey;
        return keys;
    }
}

module.exports = ConfigFunc; // Export an instance

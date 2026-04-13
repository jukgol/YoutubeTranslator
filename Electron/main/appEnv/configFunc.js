// Electron/main/appEnv/configFunc.js - Moved from setting_service/settingService.js
const fs = require('fs');
const path = require('path');
const log = require('../js/logManager');

class ConfigFunc { // Renamed from SettingService
    constructor(appEnvInstance) { // Accept appEnv instance        
        this.path = appEnvInstance.pathData; // Access pathData from the appEnv instance
        this.configData = appEnvInstance.configData; // Direct access to configData
        this.readApiKeys();
        this.loadVersion();
        this.loadInitData();
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

    loadInitData() {
        const filePath = this.path.initDataFile;
        if (!fs.existsSync(filePath)) {
            this.configData.selectedRulePreset = "custom";
            return this.loadRule();
        }
        try {
            const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            const presetName = data.promptRule || "custom";
            this.configData.selectedRulePreset = presetName;

            if (presetName === "custom") {
                return this.loadRule();
            } else {
                const content = this.readRulePreset(presetName);
                if (content) {
                    this.configData.promptRule = content;
                    return content;
                } else {
                    return this.loadRule();
                }
            }
        } catch (error) {
            log.write(`❌ initdata.json 읽기 실패: ${error.message}`);
            this.configData.selectedRulePreset = "custom";
            return this.loadRule();
        }
    }

    saveInitData(presetName) {
        try {
            const data = { promptRule: presetName };
            this._writeFile(this.path.initDataFile, JSON.stringify(data, null, 2));
            this.configData.selectedRulePreset = presetName;
            log.write(`💾 설정 저장됨 (initdata.json): ${presetName}`);
        } catch (error) {
            log.write(`❌ initdata.json 저장 실패: ${error.message}`);
        }
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

        log.write(`🔑 API 키 선택됨: ${selected || "None"}`);

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

        log.write(`🔑 새 API 키 추가 및 선택됨: ${newKey || "None"}`);

        return keys;
    }

    getRuleFiles() {
        const dirPath = this.path.ruleDir;
        if (!fs.existsSync(dirPath)) {
            return [];
        }
        try {
            return fs.readdirSync(dirPath).filter(file => {
                const fullPath = path.join(dirPath, file);
                return fs.statSync(fullPath).isFile();
            });
        } catch (error) {
            log.write(`❌ 규칙 파일 목록 읽기 실패: ${error.message}`);
            return [];
        }
    }

    readRulePreset(filename) {
        const filePath = path.join(this.path.ruleDir, filename);
        return this._readFile(filePath);
    }

    createRulePreset(filename, content) {
        if (!filename.endsWith('.txt')) {
            filename += '.txt';
        }
        const filePath = path.join(this.path.ruleDir, filename);
        try {
            this._writeFile(filePath, content);
            log.write(`📄 새 지침 파일 생성됨: ${filename}`);
            return true;
        } catch (error) {
            log.write(`❌ 지침 파일 생성 실패: ${error.message}`);
            return false;
        }
    }

    deleteRulePreset(filename) {
        if (!filename || filename === 'custom') return false;
        const filePath = path.join(this.path.ruleDir, filename);
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                log.write(`🗑️ 지침 프리셋 파일 삭제됨: ${filename}`);
                return true;
            } catch (error) {
                log.write(`❌ 지침 프리셋 파일 삭제 실패: ${error.message}`);
                return false;
            }
        }
        return false;
    }
}

module.exports = ConfigFunc; // Export an instance

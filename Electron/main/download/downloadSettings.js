const fs = require('fs');
const path = require('path');
const appEnv = require('../appEnv/appEnv');

class DownloadSettingsManager {
    constructor() {
        this.settingsFile = 'download.json';
    }

    getSettingsPath() {
        // AppEnv might not be fully initialized when this module is required, 
        // depending on circular deps, but here we access it inside methods.
        // We exposed this.configDir in PathData.
        return path.join(appEnv.pathData.configDir, this.settingsFile);
    }

    loadSettings() {
        try {
            const filePath = this.getSettingsPath();
            if (fs.existsSync(filePath)) {
                const data = fs.readFileSync(filePath, 'utf-8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load download settings:', error);
        }
        // Default settings
        return {
            quality: 'best',
            downloadSubs: true
        };
    }

    saveSettings(settings) {
        try {
            const filePath = this.getSettingsPath();
            // Ensure config dir exists (should be created by PathData, but safety check)
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
            return true;
        } catch (error) {
            console.error('Failed to save download settings:', error);
            return false;
        }
    }
}

module.exports = new DownloadSettingsManager();

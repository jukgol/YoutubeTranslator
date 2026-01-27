// electron/main/path_service/pathManager.js
const path = require('path');
const fs = require('fs');
const { app } = require('electron'); // Electron's app module provides app.getPath('userData') etc.

class PathManager {
    constructor() {
        // Determine base directory
        // In Electron, app.isPackaged checks if the app is running in a packaged form.
        // app.getPath('exe') gives the path to the executable.
        // app.getAppPath() gives the path to the app's source code (or asar archive).
        // For development, we want the project root.
        this.base_dir = app.isPackaged 
            ? path.dirname(app.getPath('exe')) // For packaged app
            : path.resolve(__dirname, '../../..'); // For development, assumes pathManager.js is in project_root/electron/main/path_service

        // --- [1. 폴더 경로 정의] ---
        const dataDir = path.join(this.base_dir, "data");
        this.originDir = path.join(dataDir, "origin");
        this.splitDir = path.join(dataDir, "split");
        this.translateDir = path.join(dataDir, "translate");
        this.combineDir = path.join(dataDir, "combine");
        this.resultFinalDir = path.join(dataDir, "result");
        this.videoDir = path.join(dataDir, "video");      // 영상 파일(.mp4) 저장 위치
        
        // config 폴더 경로
        const configDir = path.join(this.base_dir, "setconfig");

        // --- [2. 파일 경로 정의] ---
        this.apiFile = path.join(configDir, "api.txt");
        this.ruleFile = path.join(configDir, "rule.txt");
        this.geminiVerFile = path.join(configDir, "gemini_ver.txt");
        this.cookieFile = path.join(configDir, "cookies.txt");
        
        // --- [3. 폴더 자동 생성] ---
        this.allDirs = [
            this.originDir, this.splitDir, this.translateDir, 
            this.combineDir, this.resultFinalDir, this.videoDir
        ];
        
        this._createDirectories();
    }

    _createDirectories() {
        this.allDirs.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // --- [4. 유틸리티 메서드] ---
    getVideoPath(filename) {
        return path.join(this.videoDir, filename);
    }

    getOriginSubPath(filename) {
        return path.join(this.originDir, filename);
    }
}

const paths = new PathManager();
module.exports = paths;

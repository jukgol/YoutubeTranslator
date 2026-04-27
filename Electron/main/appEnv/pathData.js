const path = require('path');
const fs = require('fs');
const { app } = require('electron'); // Import Electron's app module

class PathData {
    constructor(filePathData) {
        // Determine base directory
        this.base_dir = app.isPackaged
            ? path.dirname(app.getPath('exe')) // For packaged app
            : path.resolve(__dirname, '../../..'); // Corrected path: Electron/main/appEnv -> project_root (F:\ProjectGit\YoutubeTranslator)

        // --- [1. 폴더 경로 정의] ---
        const dataDir = path.join(this.base_dir, filePathData.dataDir);
        this.originDir = path.join(dataDir, filePathData.originDir);
        this.splitDir = path.join(dataDir, filePathData.splitDir);
        this.translateDir = path.join(dataDir, filePathData.translateDir);
        this.combineDir = path.join(dataDir, filePathData.combineDir);
        this.resultFinalDir = path.join(dataDir, filePathData.resultDir);
        this.videoDir = filePathData.videoDir;      // 영상 파일(.mp4) 저장 위치

        // config 폴더 경로
        this.configDir = path.join(this.base_dir, filePathData.configDir);
        this.ruleDir = path.join(this.configDir, filePathData.ruleDir);
        this.modelDir = path.join(this.configDir, filePathData.modelDir); // setconfig/models

        // --- [2. 파일 경로 정의] ---
        this.apiFile = path.join(this.configDir, filePathData.apiFile);
        this.ruleFile = path.join(this.ruleDir, filePathData.ruleFile);
        this.geminiVerFile = path.join(this.configDir, filePathData.geminiVerFile);
        this.cookieFile = path.join(this.configDir, filePathData.cookieFile);
        this.initDataFile = path.join(this.configDir, filePathData.initDataFile);

        // --- [3. 폴더 자동 생성] ---
        this.allDirs = [
            this.originDir, this.splitDir, this.translateDir,
            this.combineDir, this.resultFinalDir, this.videoDir,
            this.ruleDir
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

module.exports = PathData; // Export the class itself
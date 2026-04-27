const path = require('path');
const fs = require('fs');
const { app } = require('electron');

class FilePath {
    constructor() {
        // Determine base directory
        this.base_dir = app.isPackaged
            ? path.dirname(app.getPath('exe'))
            : path.resolve(__dirname, '../../..');

        this.configDir = path.join(this.base_dir, "setconfig");
        this.filePathJson = path.join(this.configDir, "filepath.json");

        // 기본값 설정 (폴더명 및 파일명)
        this.data = {
            // [1. 폴더 이름 정의]
            configDir: "setconfig",
            ruleDir: "rule",
            modelDir: "models",
            dataDir: "data",
            originDir: "origin",
            splitDir: "split",
            translateDir: "translate",
            combineDir: "combine",
            resultDir: "result",
            videoDir: "E:\\video\\youtube",

            // [2. 파일 이름 정의]
            apiFile: "api.txt",
            ruleFile: "rule.txt",
            geminiVerFile: "gemini_ver.txt",
            cookieFile: "cookies.txt",
            initDataFile: "initdata.json"
        };

        this._initialize();
    }

    _initialize() {
        // 1. setconfig 폴더 확인 및 생성
        if (!fs.existsSync(this.configDir)) {
            console.log('[FilePath] Creating config directory:', this.configDir);
            fs.mkdirSync(this.configDir, { recursive: true });
        }

        // 2. filepath.json 확인 및 생성/로드
        if (!fs.existsSync(this.filePathJson)) {
            console.log('[FilePath] Creating default filepath.json');
            fs.writeFileSync(this.filePathJson, JSON.stringify(this.data, null, 2), 'utf8');
        } else {
            try {
                const fileContent = fs.readFileSync(this.filePathJson, 'utf8');
                const savedData = JSON.parse(fileContent);
                // 기본값과 병합 (누락된 필드가 있을 경우 대비)
                this.data = { ...this.data, ...savedData };
                console.log('[FilePath] Loaded filepath.json');
            } catch (e) {
                console.error("[FilePath] Failed to load filepath.json, using defaults.", e);
            }
        }
    }

    save(newData) {
        try {
            // 전달받은 데이터로 업데이트 (단일 필드 업데이트도 가능하도록 병합)
            this.data = { ...this.data, ...newData };
            fs.writeFileSync(this.filePathJson, JSON.stringify(this.data, null, 2), 'utf8');
            console.log('[FilePath] Saved filepath.json');
            return true;
        } catch (e) {
            console.error("[FilePath] Failed to save filepath.json", e);
            return false;
        }
    }
}

module.exports = FilePath;

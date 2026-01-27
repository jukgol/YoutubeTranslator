// electron/main/path_service/pathService.js
const path = require('path');
const fs = require('fs');
const { shell } = require('electron'); // For opening files/folders

class SubtitlePathService {
    constructor(pathManager) {
        this.path = pathManager; // pathManager instance (from pathManager.js)
    }

    getOriginPath(filename) {
        if (!filename) return null;
        return path.join(this.path.originDir, filename);
    }

    getSplitFolderPath(folderName) {
        if (!folderName) return null;
        return path.join(this.path.splitDir, folderName);
    }

    getTranslateFolderPath(folderName) {
        if (!folderName) return null;
        return path.join(this.path.translateDir, folderName);
    }

    getCombineFilePath(filename) {
        if (!filename) return null;
        return path.join(this.path.combineDir, filename);
    }

    getOriginSrtForCombine(combineFilename) {
        if (!combineFilename) return null;
        const originName = path.parse(combineFilename).name + ".srt";
        return path.join(this.path.originDir, originName);
    }

    checkFileExists(filePath) {
        return filePath ? fs.existsSync(filePath) : false;
    }
}

function getFolderFiles(folderPath, extensions = null, exclude = null) {
    if (!fs.existsSync(folderPath)) {
        return [];
    }
    
    let files = fs.readdirSync(folderPath).filter(f => fs.statSync(path.join(folderPath, f)).isFile());
    
    if (extensions) {
        files = files.filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)));
    }
    
    if (exclude) {
        files = files.filter(f => !exclude.some(ext => f.toLowerCase().endsWith(ext)));
    }
        
    return files.sort(); // Sort alphabetically
}

function copyFileToFolder(sourceFilePath, targetFolderPath) {
    try {
        if (!fs.existsSync(sourceFilePath) || !fs.statSync(sourceFilePath).isFile()) {
            return { success: false, message: "원본 파일을 찾을 수 없습니다." };
        }
        
        if (!fs.existsSync(targetFolderPath)) {
            fs.mkdirSync(targetFolderPath, { recursive: true });
        }
            
        fs.copyFileSync(sourceFilePath, path.join(targetFolderPath, path.basename(sourceFilePath)));
        return { success: true, message: "복사 성공" };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

function openFolderInExplorer(folderPath) {
    if (!fs.existsSync(folderPath)) {
        return { success: false, message: `폴더가 존재하지 않습니다: ${folderPath}` };
    }

    try {
        shell.openPath(folderPath); // Electron's shell module
        return { success: true, message: "성공" };
    } catch (e) {
        return { success: false, message: e.message };
    }
}

// Export the class and utility functions
module.exports = {
    SubtitlePathService,
    getFolderFiles,
    copyFileToFolder,
    openFolderInExplorer,
};

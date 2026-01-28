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

function getSubdirectories(folderPath) {
    try {
        if (!fs.existsSync(folderPath)) {
            console.log(`[Main Debug] Subdirectories: Path does not exist: ${folderPath}`);
            return [];
        }
        const allItems = fs.readdirSync(folderPath);
        return allItems.filter(item => {
            return fs.statSync(path.join(folderPath, item)).isDirectory();
        }).sort();
    } catch (error) {
        console.error(`[Main Debug] Error getting subdirectories from ${folderPath}:`, error);
        return [];
    }
}

function getFilesinDirectory(directoryPath, extensions = null) {
    try {
        if (!fs.existsSync(directoryPath)) {
            console.log(`[Main Debug] Files in Directory: Path does not exist: ${directoryPath}`);
            return [];
        }
        const allItems = fs.readdirSync(directoryPath);
        let files = allItems.filter(item => {
            return fs.statSync(path.join(directoryPath, item)).isFile();
        });

        if (extensions) {
            files = files.filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)));
        }
        return files.sort();
    } catch (error) {
        console.error(`[Main Debug] Error getting files from directory ${directoryPath}:`, error);
        return [];
    }
}


function getFolderFiles(folderPath, extensions = null, exclude = null) {
    console.log('[Main Debug] 함수 시작 - 경로:', folderPath); // 1단계

    try {
        if (!fs.existsSync(folderPath)) {
            console.log('[Main Debug] 경로가 존재하지 않음');
            return [];
        }
        
        console.log('[Main Debug] 폴더 읽기 시도...'); // 2단계
        const allItems = fs.readdirSync(folderPath);
        
        let files = allItems.filter(f => {
            try {
                // 여기서 권한 문제나 path 모듈 미선언 에러가 자주 발생합니다.
                return fs.statSync(path.join(folderPath, f)).isFile();
            } catch (e) {
                console.log(`[Main Debug] 파일 확인 중 에러 (${f}):`, e.message);
                return false;
            }
        });
        
        console.log('[Main Debug] 파일 필터링 완료:', files.length, '개'); // 3단계
        
        if (extensions) {
            files = files.filter(f => extensions.some(ext => f.toLowerCase().endsWith(ext)));
        }
        
        if (exclude) {
            files = files.filter(f => !exclude.some(ext => f.toLowerCase().endsWith(ext)));
        }
            
        console.log('[Main Debug] 최종 리턴 직전'); // 4단계
        return files.sort(); 
        
    } catch (globalError) {
        console.error('[Main Debug] 치명적 에러 발생:', globalError); // 전체 에러 포착
        return []; 
    }
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
    getSubdirectories,
    getFilesinDirectory,
    getFolderFiles,
    copyFileToFolder,
    openFolderInExplorer,
};

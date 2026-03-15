const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { splitSubtitleLogic } = require('../logic/split');
const { combinePartsLogic } = require('../logic/combine');
const { combineTimelineLogic } = require('../logic/combineTimeline');
const { translateSubtitleLogic, clearFolderContents } = require('../logic/translate');

const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');

async function findOriginalFile(baseName) {
    const srtPath = path.join(appEnv.pathData.originDir, `${baseName}.srt`);
    const vttPath = path.join(appEnv.pathData.originDir, `${baseName}.vtt`);
    try {
        await fs.access(srtPath);
        return srtPath;
    } catch (e) {
        try {
            await fs.access(vttPath);
            return vttPath;
        } catch (e2) {
            return null;
        }
    }
}

function setupProcessHandlers() {
    ipcMain.handle('process:run-split', async (event, filename) => {
        if (!filename) {
            log.write('[Error] 분할 실행: 파일 이름이 제공되지 않았습니다.');
            return { success: false, message: '파일 이름이 제공되지 않았습니다.' };
        }

        try {
            const originDir = appEnv.pathData.originDir;
            const fullPath = path.join(originDir, filename);
            const createdFolderPath = await splitSubtitleLogic(fullPath);
            
            return { success: true, message: `${filename} 파일 분할이 완료되었습니다.`, createdFolder: createdFolderPath };

        } catch (error) {
            log.write(`[Error] 파일 분할 중 오류 발생 (${filename}): ${error.message}`);
            return { success: false, message: `파일 분할 중 오류 발생: ${error.message}` };
        }
    });

    ipcMain.handle('process:run-combine', async (event, folderName) => {
        if (!folderName) {
            log.write('[Error] 파트 합치기: 폴더 이름이 제공되지 않았습니다.');
            return { success: false, message: '폴더 이름이 제공되지 않았습니다.' };
        }

        try {
            const result = await combinePartsLogic(folderName); // Capture the result object
            
            if (result.success) {
                return { success: true, message: `${folderName} 파트 합치기가 완료되었습니다.`, combinedFile: result.combinedFile };
            } else {
                return { success: false, message: result.message || `${folderName} 파트 합치기 중 오류가 발생했거나, 합칠 파일이 없습니다.`, combinedFile: null };
            }

        } catch (error) {
            log.write(`[Error] 파트 합치기 중 오류 발생 (${folderName}): ${error.message}`);
            return { success: false, message: `파트 합치기 중 오류 발생: ${error.message}` };
        }
    });

    ipcMain.handle('process:run-timeline', async (event, combinedTxtFilename) => {
        if (!combinedTxtFilename) {
            log.write('[Error] 타임라인 생성: TXT 파일 이름이 제공되지 않았습니다.');
            return { success: false, message: 'TXT 파일 이름이 제공되지 않았습니다.' };
        }

        try {
            
            const combinedTextPath = path.join(appEnv.pathData.combineDir, combinedTxtFilename);
            const baseName = combinedTxtFilename.replace(/\.txt$/, '');
            
            const originSrtPath = await findOriginalFile(baseName);

            if (!originSrtPath) {
                const message = `타임라인을 가져올 원본 파일(.srt 또는 .vtt)을 찾을 수 없습니다: ${baseName}`;
                log.write(`[Error] ${message}`);
                return { success: false, message };
            }

            const result = await combineTimelineLogic(combinedTextPath, originSrtPath);

            if (result.success) {
                return { success: true, message: `타임라인 생성이 완료되었습니다: ${path.basename(originSrtPath)}`, finalSrtFile: result.finalSrtFile };
            } else {
                return { success: false, message: result.message || '타임라인 생성 중 오류가 발생했습니다.', finalSrtFile: null };
            }

        } catch (error) {
            log.write(`[Error] 타임라인 생성 중 오류 발생 (${combinedTxtFilename}): ${error.message}`);
            return { success: false, message: `타임라인 생성 중 오류 발생: ${error.message}` };
        }
    });
    ipcMain.handle('process:run-translation', async (event, folderName) => {
        if (!folderName) {
            log.write('[Error] 번역 실행: 폴더 이름이 제공되지 않았습니다.');
            return { success: false, message: '폴더 이름이 제공되지 않았습니다.' };
        }
        
        try {
            const folderPath = path.join(appEnv.pathData.splitDir, folderName);
            
            // 번역을 시작하기 전에 해당 영상의 번역 결과 폴더를 비웁니다.
            const resultDir = path.join(appEnv.pathData.translateDir, folderName);
            await clearFolderContents(resultDir);

            const files = await fs.readdir(folderPath);
            const txtFiles = files.filter(f => f.toLowerCase().endsWith('.txt')).sort();

            if (txtFiles.length === 0) {
                return { success: true, message: '번역할 파일이 없습니다.' };
            }

            let allSucceeded = true;
            let finalTranslatedFolder = null; // To store the path of the created folder

            for (const file of txtFiles) {
                const filePath = path.join(folderPath, file);
                const result = await translateSubtitleLogic(filePath); // Capture the result object
                
                if (result.success) {
                    if (finalTranslatedFolder === null) {
                        // Assume all translated files go into the same folder
                        finalTranslatedFolder = result.translatedFolder; 
                    }
                } else {
                    allSucceeded = false;
                    // Optionally break here if you want to stop on first failure
                    // break; 
                }
            }
            
            if (allSucceeded) {
                return { success: true, message: `${folderName} 폴더의 모든 파일 번역이 완료되었습니다.`, translatedFolder: finalTranslatedFolder };
            } else {
                return { success: false, message: `${folderName} 폴더 번역 중 일부 파일에서 오류가 발생했습니다.`, translatedFolder: finalTranslatedFolder };
            }

        } catch (error) {
            log.write(`[Error] 번역 작업 중 오류 발생 (${folderName}): ${error.message}`);
            return { success: false, message: `번역 작업 중 오류 발생: ${error.message}` };
        }
    });
}

module.exports = { setupProcessHandlers };

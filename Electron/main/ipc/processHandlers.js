const { ipcMain } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { splitSubtitleLogic } = require('../logic/split');
const { combinePartsLogic } = require('../logic/combine');
const { combineTimelineLogic } = require('../logic/combineTimeline');
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
            
            log.write(`[IPC] 'process:run-split' 요청 수신: ${fullPath}`);
            await splitSubtitleLogic(fullPath);
            
            return { success: true, message: `${filename} 파일 분할이 완료되었습니다.` };

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
            log.write(`[IPC] 'process:run-combine' 요청 수신: ${folderName}`);
            const success = await combinePartsLogic(folderName);
            
            if (success) {
                return { success: true, message: `${folderName} 파트 합치기가 완료되었습니다.` };
            } else {
                return { success: false, message: `${folderName} 파트 합치기 중 오류가 발생했거나, 합칠 파일이 없습니다.` };
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
            log.write(`[IPC] 'process:run-timeline' 요청 수신: ${combinedTxtFilename}`);
            
            const combinedTextPath = path.join(appEnv.pathData.combineDir, combinedTxtFilename);
            const baseName = combinedTxtFilename.replace(/\.txt$/, '');
            
            const originSrtPath = await findOriginalFile(baseName);

            if (!originSrtPath) {
                const message = `타임라인을 가져올 원본 파일(.srt 또는 .vtt)을 찾을 수 없습니다: ${baseName}`;
                log.write(`[Error] ${message}`);
                return { success: false, message };
            }

            const success = await combineTimelineLogic(combinedTextPath, originSrtPath);

            if (success) {
                return { success: true, message: `타임라인 생성이 완료되었습니다: ${path.basename(originSrtPath)}` };
            } else {
                return { success: false, message: '타임라인 생성 중 오류가 발생했습니다.' };
            }

        } catch (error) {
            log.write(`[Error] 타임라인 생성 중 오류 발생 (${combinedTxtFilename}): ${error.message}`);
            return { success: false, message: `타임라인 생성 중 오류 발생: ${error.message}` };
        }
    });
}

module.exports = { setupProcessHandlers };

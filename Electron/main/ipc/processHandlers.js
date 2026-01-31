// Electron/main/ipc/processHandlers.js

const { ipcMain } = require('electron');
const path = require('path');
const { splitSubtitleLogic } = require('../logic/split');
const { combinePartsLogic } = require('../logic/combine');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');

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
}

module.exports = { setupProcessHandlers };

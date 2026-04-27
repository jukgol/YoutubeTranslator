const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');
const { activeProcesses } = require('./pythonProcessManager');

function setupPythonDownloadHandlers() {
    // 모델 다운로드 전용 핸들러
    ipcMain.handle('python:download-model', async (event, engine) => {
        const projectRoot = path.resolve(__dirname, '../../../Python');
        const pythonExe = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');
        const relativeScriptPath = path.join('subtitleEx', 'main.py');

        const args = [
            '-u', relativeScriptPath,
            '--download_only',
            '--engine', engine || 'sense',
            '--model_dir', appEnv.pathData.modelDir
        ];

        return new Promise((resolve) => {
            const pythonProcess = spawn(pythonExe, args, {
                cwd: projectRoot,
                env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
            });

            activeProcesses.add(pythonProcess);

            pythonProcess.stdout.on('data', (data) => {
                const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
                const str = data.toString().replace(ansiRegex, '').trim();
                if (str) {
                    log.write(`[Model Download] ${str}`);
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
                const str = data.toString().replace(ansiRegex, '').trim();
                if (str) {
                    const isProgressBar = str.includes('%|') && str.includes('|');
                    log.write(`[Model Download Stderr] ${str}`, isProgressBar);
                }
            });

            pythonProcess.on('close', (code) => {
                activeProcesses.delete(pythonProcess);
                if (code === 0) {
                    resolve({ success: true, message: 'Model download complete.' });
                } else {
                    resolve({ success: false, message: `Process failed with code ${code}` });
                }
            });

            pythonProcess.on('error', (err) => {
                activeProcesses.delete(pythonProcess);
                log.write(`[Model Download] Error: ${err.message}`);
                resolve({ success: false, message: err.message });
            });
        });
    });
}

module.exports = { setupPythonDownloadHandlers };

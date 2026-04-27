const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');
const { activeProcesses } = require('./pythonProcessManager');

function setupPythonVideoHandlers() {
    // 비디오 다운로드 전용 핸들러 (IPC용)
    ipcMain.handle('python:run-download', async (event, url, output, format, subs, autosubs) => {
        return runPythonDownload(url, output, format, subs, autosubs, (msg) => {
            event.sender.send('python:download-progress', msg);
        });
    });
}

/**
 * Core function to run Python downloader
 * Can be called directly from Main process or via IPC
 */
function runPythonDownload(url, output, format, subs, autosubs, onProgress) {
    const projectRoot = path.resolve(__dirname, '../../../Python');
    const scriptPath = path.resolve(projectRoot, 'download', 'downloader.py');

    const pythonExe = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');

    const args = [
        '-u', scriptPath,
        '--url', url,
        '--output', output,
        '--format', format || 'bestvideo+bestaudio/best'
    ];

    if (subs) args.push('--subs');
    if (autosubs) args.push('--autosubs');

    // Dailymotion은 쿠키 사용 시 401 오류가 발생하는 경우가 있어 제외
    const isDailymotion = url.includes('dailymotion.com') || url.includes('dai.ly');
    if (!isDailymotion && fs.existsSync(appEnv.pathData.cookieFile)) {
        args.push('--cookies', appEnv.pathData.cookieFile);
    }

    return new Promise((resolve) => {
        const pythonProcess = spawn(pythonExe, args, {
            cwd: projectRoot,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        activeProcesses.add(pythonProcess);

        pythonProcess.stdout.on('data', (data) => {
            const str = data.toString().trim();
            if (str) {
                const lines = str.split(/[\r\n]+/);
                lines.forEach(line => {
                    if (onProgress) onProgress(line);
                });
            }
        });

        pythonProcess.stderr.on('data', (data) => {
            const str = data.toString().trim();
            if (str) {
                const lines = str.split(/[\r\n]+/);
                lines.forEach(line => {
                    log.write(`[Download Err] ${line}`);
                });
            }
        });

        pythonProcess.on('close', (code) => {
            activeProcesses.delete(pythonProcess);
            if (code === 0) {
                resolve({ success: true, message: 'Download complete.' });
            } else {
                resolve({ success: false, message: `Process failed with code ${code}` });
            }
        });

        pythonProcess.on('error', (err) => {
            activeProcesses.delete(pythonProcess);
            log.write(`[Download] Spawn error: ${err.message}`);
            resolve({ success: false, message: err.message });
        });
    });
}

module.exports = { setupPythonVideoHandlers, runPythonDownload };

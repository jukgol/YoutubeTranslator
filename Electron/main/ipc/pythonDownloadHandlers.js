const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv');
const { activeProcesses } = require('./pythonProcessManager');

function setupPythonDownloadHandlers() {
    ipcMain.handle('python:run-download', async (event, url, outputTmpl, formatOpt, subs, autoSubs) => {
        return runPythonDownload(url, outputTmpl, formatOpt, subs, autoSubs, (progressMsg) => {
            event.sender.send('python:download-progress', progressMsg);
        });
    });
}

function runPythonDownload(url, outputTmpl, formatOpt, subs, autoSubs, onProgress) {
    const projectRoot = path.resolve(__dirname, '../../../Python');
    const downloadScript = path.join(projectRoot, 'download', 'downloader.py');

    return new Promise((resolve) => {
        // Use direct python.exe from .venv to bypass poetry overhead/quoting issues
        const pythonExe = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');
        const relativeScriptPath = path.join('download', 'downloader.py');
        
        const args = [
            '-u', relativeScriptPath,
            '--url', url,
            '--output', outputTmpl,
            '--format', formatOpt
        ];

        if (subs) args.push('--subs');
        if (autoSubs) args.push('--autosubs');

        // Add cookies if available
        if (fs.existsSync(appEnv.pathData.cookieFile)) {
            args.push('--cookies', appEnv.pathData.cookieFile);
        }

        // console.log(`[Python] Spawning: ${pythonExe} ${args.join(' ')}`);

        const pythonProcess = spawn(pythonExe, args, {
            cwd: projectRoot,
            env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
        });

        activeProcesses.add(pythonProcess);
        // console.log(`[Python] Download process spawned (PID: ${pythonProcess.pid}). Total active: ${activeProcesses.size}`);

        pythonProcess.stdout.on('data', (data) => {
            const lines = data.toString().split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed) {
                    if (trimmed.startsWith('[PROGRESS]') && onProgress) {
                        onProgress(trimmed);
                    } else if (trimmed.startsWith('[ERROR]')) {
                        log.write(`[Python Downloader] ${trimmed}`);
                    } else if (trimmed.startsWith('[INFO]') || trimmed.startsWith('[DONE]')) {
                        // Suppress info/done logs from UI to keep it clean
                        console.log(`[Python Downloader] ${trimmed}`);
                    }
                }
            });
        });

        pythonProcess.stderr.on('data', (data) => {
            log.write(`[Python Downloader Stderr] ${data.toString().trim()}`);
        });

        pythonProcess.on('close', (code) => {
            activeProcesses.delete(pythonProcess);
            // console.log(`[Python] Download process closed (PID: ${pythonProcess.pid}). Remaining: ${activeProcesses.size}`);
            if (code === 0) {
                resolve({ success: true });
            } else {
                resolve({ success: false, message: `Exit code ${code}` });
            }
        });

        pythonProcess.on('error', (err) => {
            activeProcesses.delete(pythonProcess);
            log.write(`[Python Downloader] Spawn error: ${err.message}`);
            resolve({ success: false, message: err.message });
        });
    });
}

module.exports = { setupPythonDownloadHandlers, runPythonDownload };

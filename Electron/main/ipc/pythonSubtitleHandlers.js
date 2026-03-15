const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');
const { activeProcesses } = require('./pythonProcessManager');

function setupPythonSubtitleHandlers() {
    ipcMain.handle('python:run-subtitle', async (event, videoPath, language) => {
        if (!videoPath) {
            return { success: false, message: 'Video path is required.' };
        }

        const projectRoot = path.resolve(__dirname, '../../../Python');
        const mainScript = path.join(projectRoot, 'subtitleEx', 'main.py');
        const originDir = appEnv.pathData.originDir;

        log.write(`[Python] Starting subtitle extraction for: ${videoPath}, Language: ${language || 'Auto'}`);

        return new Promise((resolve) => {
            const pythonExe = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');
            const relativeScriptPath = path.join('subtitleEx', 'main.py');

            const args = [
                '-u', relativeScriptPath,
                '--file', videoPath,
                '--output', originDir,
                '--task', 'transcribe'
            ];
            
            if (language) {
                args.push('--language', language);
            }

            log.write(`[Python] Spawning: ${pythonExe} ${args.join(' ')}`);

            const pythonProcess = spawn(pythonExe, args, {
                cwd: projectRoot,
                env: { ...process.env, PYTHONIOENCODING: 'utf-8', HF_HUB_DISABLE_SYMLINKS_WARNING: '1' }
            });

            activeProcesses.add(pythonProcess);
            log.write(`[Python] Subtitle process spawned (PID: ${pythonProcess.pid}). Total active: ${activeProcesses.size}`);

            let errorOutput = '';
            let successMarkerFound = false;

            pythonProcess.stdout.on('data', (data) => {
                const lines = data.toString().split('\n');
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (trimmed) {
                        if (trimmed.includes('[DONE] Transcription complete')) {
                            successMarkerFound = true;
                        }

                        if (trimmed.startsWith('[PROGRESS]')) {
                            event.sender.send('python:progress', trimmed);
                        } else if (trimmed.startsWith('[INFO]') || trimmed.startsWith('[ERROR]') || trimmed.startsWith('[DONE]')) {
                            event.sender.send('python:progress', trimmed);
                            log.write(`[Python] ${trimmed}`);
                        }
                    }
                });
            });

            pythonProcess.stderr.on('data', (data) => {
                const msg = data.toString().trim();
                if (msg.includes('MonitorThread')) return;
                log.write(`[Python Stderr] ${msg}`);
                errorOutput += msg + '\n';
            });

            pythonProcess.on('close', (code) => {
                activeProcesses.delete(pythonProcess);
                log.write(`[Python] Subtitle process closed (PID: ${pythonProcess.pid}). Remaining: ${activeProcesses.size}`);
                
                if (successMarkerFound || code === 0) {
                    resolve({ success: true, message: 'Subtitle extraction complete.' });
                } else {
                    resolve({ success: false, message: `Process failed with code ${code}. Details: ${errorOutput}` });
                }
            });

            pythonProcess.on('error', (err) => {
                activeProcesses.delete(pythonProcess);
                log.write(`[Python] Spawn error: ${err.message}`);
                resolve({ success: false, message: `Failed to start Python process: ${err.message}` });
            });
        });
    });
}

module.exports = { setupPythonSubtitleHandlers };

const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');

function setupPythonHandlers() {
    ipcMain.handle('python:run-subtitle', async (event, videoPath, language) => {
        if (!videoPath) {
            return { success: false, message: 'Video path is required.' };
        }

        // appEnv.getPath is not available. Using relative path from this file (Electron/main/ipc/pythonHandlers.js)
        const projectRoot = path.resolve(__dirname, '../../../Python');
        const mainScript = path.join(projectRoot, 'subtitleEx', 'main.py');
        const originDir = appEnv.pathData.originDir;

        log.write(`[Python] Starting subtitle extraction for: ${videoPath}, Language: ${language || 'Auto'}`);
        log.write(`[Python] Output directory: ${originDir}`);

        return new Promise((resolve) => {
            // Using 'poetry' directly assumes it's in PATH. 
            // If not, we might need full path or use 'python' in venv.
            // For now, let's try 'poetry run python ...' as user environment seems to support it.
            const args = [
                'run', 'python', '-u', mainScript,
                '--file', `"${videoPath}"`, // Quote path to handle spaces
                '--output', `"${originDir}"`,
                '--task', 'transcribe'
            ];

            if (language) {
                args.push('--language', language);
            }

            const pythonProcess = spawn('poetry', args, {
                cwd: projectRoot,
                shell: true,
                env: { ...process.env, PYTHONIOENCODING: 'utf-8', HF_HUB_DISABLE_SYMLINKS_WARNING: '1' }
            });

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

                        // Parse progress tag
                        if (trimmed.startsWith('[PROGRESS]')) {
                            event.sender.send('python:progress', trimmed);
                        } else if (trimmed.startsWith('[INFO]')) {
                            event.sender.send('python:progress', trimmed);
                            log.write(`[Python] ${trimmed}`);
                        } else if (trimmed.startsWith('[ERROR]')) {
                            event.sender.send('python:progress', trimmed);
                            log.write(`[Python] ${trimmed}`);
                        } else if (trimmed.startsWith('[DONE]')) {
                            log.write(`[Python] ${trimmed}`);
                        }
                    }
                });
            });

            pythonProcess.stderr.on('data', (data) => {
                const msg = data.toString().trim();
                // Ignore specific PyTorch/monitor warnings
                if (msg.includes('MonitorThread')) return;

                log.write(`[Python Stderr] ${msg}`);
                errorOutput += msg + '\n';
            });

            pythonProcess.on('close', (code) => {
                // Trust the [DONE] marker first, because sys.exit(0) can sometimes yield non-zero codes 
                // when wrapped in poetry or due to messy thread shutdowns in Python.
                if (successMarkerFound || code === 0) {
                    log.write(`[Python] Subtitle extraction finished successfully (Code: ${code}, Verified: ${successMarkerFound}).`);
                    resolve({ success: true, message: 'Subtitle extraction complete.' });
                } else {
                    log.write(`[Python] Process exited with code ${code}`);
                    resolve({ success: false, message: `Process failed with code ${code}. Details: ${errorOutput}` });
                }
            });

            pythonProcess.on('error', (err) => {
                log.write(`[Python] Spawn error: ${err.message}`);
                resolve({ success: false, message: `Failed to start Python process: ${err.message}` });
            });
        });
    });
}

module.exports = { setupPythonHandlers };

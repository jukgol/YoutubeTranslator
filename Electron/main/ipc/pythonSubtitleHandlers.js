const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');
const { activeProcesses } = require('./pythonProcessManager');

function setupPythonSubtitleHandlers() {
    ipcMain.handle('python:run-subtitle', async (event, videoPath, language, engine) => {
        if (!videoPath) {
            return { success: false, message: 'Video path is required.' };
        }

        const projectRoot = path.resolve(__dirname, '../../../Python');
        const mainScript = path.join(projectRoot, 'subtitleEx', 'main.py');
        const originDir = appEnv.pathData.originDir;



        return new Promise((resolve) => {
            const pythonExe = path.join(projectRoot, '.venv', 'Scripts', 'python.exe');
            const relativeScriptPath = path.join('subtitleEx', 'main.py');

            const args = [
                '-u', relativeScriptPath,
                '--file', videoPath,
                '--output', originDir,
                '--task', 'transcribe',
                '--engine', engine || 'sense',
                '--model_dir', appEnv.pathData.modelDir
            ];
            
            if (language) {
                args.push('--language', language);
            }



            const pythonProcess = spawn(pythonExe, args, {
                cwd: projectRoot,
                env: { ...process.env, PYTHONIOENCODING: 'utf-8', HF_HUB_DISABLE_SYMLINKS_WARNING: '1' }
            });

            activeProcesses.add(pythonProcess);


            let errorOutput = '';
            let successMarkerFound = false;

            pythonProcess.stdout.on('data', (data) => {
                const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
                const str = data.toString().replace(ansiRegex, '');
                const lines = str.split(/[\r\n]+/);
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return;

                    if (trimmed.includes('[DONE] 자막 작업이 완료되었습니다')) {
                        successMarkerFound = true;
                    }

                    if (trimmed.startsWith('[PROGRESS]')) {
                        event.sender.send('python:progress', trimmed);
                    } else if (trimmed.startsWith('[INFO]') || trimmed.startsWith('[ERROR]') || trimmed.startsWith('[DONE]')) {
                        event.sender.send('python:progress', trimmed);
                        log.write(`[Python] ${trimmed}`);
                    } else {
                        // Intelligent replace detection: only if it looks like a progress bar
                        const isReplace = /%\|.*\|/.test(trimmed);
                        log.write(`[Python] ${trimmed}`, isReplace);
                    }
                });
            });

            pythonProcess.stderr.on('data', (data) => {
                const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
                const str = data.toString().replace(ansiRegex, '');
                const lines = str.split(/[\r\n]+/);
                lines.forEach(line => {
                    const trimmed = line.trim();
                    if (!trimmed) return;
                    if (trimmed.includes('MonitorThread')) return;

                    // Only replace if it contains the progress bar pattern (%|...|)
                    const isReplace = /%\|.*\|/.test(trimmed);
                    log.write(`[Python Stderr] ${trimmed}`, isReplace);
                    
                    if (!isReplace) {
                        errorOutput += trimmed + '\n';
                    }
                });
            });

            pythonProcess.on('close', (code) => {
                activeProcesses.delete(pythonProcess);

                
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

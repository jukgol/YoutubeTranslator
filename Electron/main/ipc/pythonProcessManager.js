const { exec } = require('child_process');
const log = require('../js/logManager');

// Track active Python processes for cleanup on app quit
const activeProcesses = new Set();

function cleanupPythonProcesses() {
    if (activeProcesses.size === 0) return;

    log.write(`[Cleanup] Killing ${activeProcesses.size} active Python processes...`);
    activeProcesses.forEach(proc => {
        if (proc && !proc.killed) {
            try {
                if (process.platform === 'win32') {
                    exec(`taskkill /F /T /PID ${proc.pid}`, (err) => {
                        if (err) log.write(`[Cleanup] Taskkill error for PID ${proc.pid}: ${err.message}`);
                    });
                } else {
                    proc.kill('SIGKILL');
                }
            } catch (err) {
                log.write(`[Cleanup] Error killing process ${proc.pid}: ${err.message}`);
            }
        }
    });
    activeProcesses.clear();
}

module.exports = { activeProcesses, cleanupPythonProcesses };

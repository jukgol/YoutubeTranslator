// electron/renderer/js/logger.js

// This function provides a unified 'write' interface for the renderer process.
// It uses the API exposed by the preload script to send the log to the main process.
export function write(message) {
    if (window.electronAPI && typeof window.electronAPI.log === 'function') {
        window.electronAPI.log(message);
    }
}

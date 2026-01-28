// electron/main/js/logManager.js

let mainWindow = null;
let logBuffer = [];
let rendererReady = false;

// Initializer to give the logger a reference to the main window
function initialize(win) {
    mainWindow = win;
    // If window is now ready and renderer was already ready, flush any pending logs
    if (mainWindow && !mainWindow.isDestroyed() && rendererReady && logBuffer.length > 0) {
        flushBuffer();
    }
}

// Marks the renderer as ready to receive logs, and flushes any buffered logs
function setRendererReady() {
    rendererReady = true;
    if (mainWindow && !mainWindow.isDestroyed() && logBuffer.length > 0) {
        flushBuffer();
    } else if (mainWindow && !mainWindow.isDestroyed()) {
        // console.log('[Main Debug] Renderer ready, but no logs to flush or mainWindow not ready.'); // Removed debug log
    }
}

// Sends all buffered logs to the renderer
function flushBuffer() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        const logsToSend = [...logBuffer]; // Copy buffer
        logBuffer = []; // Clear buffer immediately
        logsToSend.forEach(message => {
            mainWindow.webContents.send('log-message', message);
        });
    }
}

// Function to write a log message to the renderer process
function write(message) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;

    // Always log to main console for safety
    console.log(`[Main] ${formattedMessage}`);

    if (mainWindow && !mainWindow.isDestroyed() && rendererReady) {
        // If window is ready and renderer has signaled readiness, send directly
        mainWindow.webContents.send('log-message', formattedMessage);
    } else {
        // Otherwise, buffer the message
        logBuffer.push(formattedMessage);
    }
}

module.exports = {
    initialize,
    write,
    setRendererReady,
};

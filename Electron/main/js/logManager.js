// electron/main/js/logManager.js

let mainWindow = null;
let logBuffer = [];
let rendererReady = false;

// Initializer to give the logger a reference to the main window
function initialize(win) {
    mainWindow = win;
    // If there are buffered logs, and renderer becomes ready, flush them
    if (rendererReady && logBuffer.length > 0) {
        flushBuffer();
    }
}

// Marks the renderer as ready to receive logs, and flushes any buffered logs
function setRendererReady() {
    rendererReady = true;
    if (mainWindow && !mainWindow.isDestroyed() && logBuffer.length > 0) {
        flushBuffer();
    }
}

// Sends all buffered logs to the renderer
function flushBuffer() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        logBuffer.forEach(message => {
            mainWindow.webContents.send('log-message', message);
        });
        logBuffer = []; // Clear the buffer after flushing
    }
}

// Function to write a log message to the renderer process
function write(message) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;

    if (mainWindow && !mainWindow.isDestroyed() && rendererReady) {
        // If window is ready and renderer has signaled readiness, send directly
        mainWindow.webContents.send('log-message', formattedMessage);
    } else {
        // Otherwise, buffer the message
        logBuffer.push(formattedMessage);
        // Fallback console log for early messages or if UI never becomes ready
        // console.log(`[Buffered] ${formattedMessage}`); // REMOVED
    }
}

module.exports = {
    initialize,
    write,
    setRendererReady,
};

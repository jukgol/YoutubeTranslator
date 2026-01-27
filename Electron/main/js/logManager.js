// electron/main/js/logManager.js

let mainWindow = null;

// Initializer to give the logger a reference to the main window
function initialize(win) {
    mainWindow = win;
}

// Function to write a log message to the renderer process
function write(message) {
    if (mainWindow && !mainWindow.isDestroyed()) {
        const timestamp = new Date().toLocaleTimeString();
        mainWindow.webContents.send('log-message', `[${timestamp}] ${message}`);
    } else {
        // Fallback for when the UI is not ready or has been closed
        console.log(`[UI Not Ready] ${message}`);
    }
}

module.exports = {
    initialize,
    write,
};

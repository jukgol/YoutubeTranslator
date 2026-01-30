// electron/main/js/logManager.js

let mainWindow = null;
let logBuffer = []; // Stores objects { message: string, replace: boolean }
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
        logsToSend.forEach(logEntry => { // logEntry is now an object { message: string, replace: boolean }
            mainWindow.webContents.send('log-message', logEntry);
        });
    }
}

function write(message, replace = false) {
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${message}`;

    if (replace) {
        // replace가 true일 때만 줄바꿈 없이 커서를 맨 앞으로 보내고 기존 내용을 지움
        process.stdout.write(`\r[Main] ${formattedMessage}\x1b[K`);
    } else {
        // 기존처럼 그대로 출력 (console.log는 자동으로 줄바꿈이 됨)
        console.log(`[Main] ${formattedMessage}`);
    }

    const logEntry = { message: formattedMessage, replace: replace };

    if (mainWindow && !mainWindow.isDestroyed() && rendererReady) {
        mainWindow.webContents.send('log-message', logEntry);
    } else {
        logBuffer.push(logEntry);
    }
}
module.exports = {
    initialize,
    write,
    setRendererReady,
};

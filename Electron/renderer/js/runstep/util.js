// Electron/renderer/js/runstep/util.js

export function setupOpenFolderButton(button, getDirectoryApiMethodName) {
    if (!button) return;
    
    button.addEventListener('click', async () => {
        try {
            if (window.electronAPI && typeof window.electronAPI.paths[getDirectoryApiMethodName] === 'function') {
                const dirPath = await window.electronAPI.paths[getDirectoryApiMethodName]();
                if (dirPath) {
                    await window.electronAPI.paths.openPath(dirPath);
                } else {
                    console.warn(`'${getDirectoryApiMethodName}' did not return a path.`);
                }
            } else {
                console.error(`API method '${getDirectoryApiMethodName}' not found on window.electronAPI.paths`);
            }
        } catch (error) {
            console.error(`Error opening folder via ${getDirectoryApiMethodName}:`, error);
        }
    });
}

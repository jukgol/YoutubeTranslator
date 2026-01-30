// Electron/renderer/js/download/section/videoFileButtonHandlers.js

export const setupOpenVideoFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-video-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("폴더 열기 button clicked.");
            try {
                const videoDirPath = await window.electronAPI.paths.getAppVideoDirectory();
                console.log("Video directory path from main process:", videoDirPath);
                if (videoDirPath) {
                    await window.electronAPI.paths.openPath(videoDirPath);
                    console.log("Opened video directory:", videoDirPath);
                } else {
                    console.warn("Could not retrieve video directory path.");
                }
            } catch (error) {
                console.error("Error opening video directory:", error);
            }
        });
    }
};

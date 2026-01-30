// Electron/renderer/js/download/section/subtitleFileButtonHandlers.js

export const setupOpenSubtitleFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-subtitle-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("자막 폴더 열기 button clicked.");
            try {
                const originDirPath = await window.electronAPI.paths.getAppOriginDirectory();
                console.log("Origin directory path from main process:", originDirPath);
                if (originDirPath) {
                    await window.electronAPI.paths.openPath(originDirPath);
                    console.log("Opened origin directory:", originDirPath);
                } else {
                    console.warn("Could not retrieve origin directory path.");
                }
            } catch (error) {
                console.error("Error opening origin directory:", error);
            }
        });
    }
};

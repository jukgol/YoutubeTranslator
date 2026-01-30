// Electron/renderer/js/runstep/section/translateButtonHandlers.js

export const setupOpenTranslateFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-translate-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("번역 폴더 열기 button clicked.");
            try {
                const translateDirPath = await window.electronAPI.paths.getAppTranslateDirectory();
                console.log("Translate directory path from main process:", translateDirPath);
                if (translateDirPath) {
                    await window.electronAPI.paths.openPath(translateDirPath);
                    console.log("Opened translate directory:", translateDirPath);
                } else {
                    console.warn("Could not retrieve translate directory path.");
                }
            } catch (error) {
                console.error("Error opening translate directory:", error);
            }
        });
    }
};

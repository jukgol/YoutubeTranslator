// Electron/renderer/js/runstep/section/splitButtonHandlers.js

export const setupOpenSplitFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-split-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("스플릿 폴더 열기 button clicked.");
            try {
                const splitDirPath = await window.electronAPI.paths.getAppSplitDirectory();
                console.log("Split directory path from main process:", splitDirPath);
                if (splitDirPath) {
                    await window.electronAPI.paths.openPath(splitDirPath);
                    console.log("Opened split directory:", splitDirPath);
                } else {
                    console.warn("Could not retrieve split directory path.");
                }
            } catch (error) {
                console.error("Error opening split directory:", error);
            }
        });
    }
};

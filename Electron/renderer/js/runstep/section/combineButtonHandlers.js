// Electron/renderer/js/runstep/section/combineButtonHandlers.js

export const setupOpenCombineFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-combine-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("합치기 폴더 열기 button clicked.");
            try {
                const combineDirPath = await window.electronAPI.paths.getAppCombineDirectory();
                console.log("Combine directory path from main process:", combineDirPath);
                if (combineDirPath) {
                    await window.electronAPI.paths.openPath(combineDirPath);
                    console.log("Opened combine directory:", combineDirPath);
                } else {
                    console.warn("Could not retrieve combine directory path.");
                }
            } catch (error) {
                console.error("Error opening combine directory:", error);
            }
        });
    }
};

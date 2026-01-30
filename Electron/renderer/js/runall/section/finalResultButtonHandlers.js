// Electron/renderer/js/runall/section/finalResultButtonHandlers.js

export const setupOpenFinalResultFolderButton = (sectionElement) => {
    const openFolderButton = sectionElement.querySelector('#open-final-result-folder-button');

    if (openFolderButton) {
        openFolderButton.addEventListener('click', async () => {
            console.log("최종 결과 폴더 열기 button clicked.");
            try {
                const resultDirPath = await window.electronAPI.paths.getAppResultDirectory();
                console.log("Result directory path from main process:", resultDirPath);
                if (resultDirPath) {
                    await window.electronAPI.paths.openPath(resultDirPath);
                    console.log("Opened result directory:", resultDirPath);
                } else {
                    console.warn("Could not retrieve result directory path.");
                }
            } catch (error) {
                console.error("Error opening result directory:", error);
            }
        });
    }
};

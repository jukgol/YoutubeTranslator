// Electron/renderer/js/runstep/urlHandler.js

export const addUrl = async (url) => {
    const item = await window.electronAPI.urlManager.addUrl(url); // 변경
    return item;
};

export const removeUrl = async (url) => {
    const removed = await window.electronAPI.urlManager.removeUrl(url); // 변경
    return removed;
};

export const updateTitle = async (url) => {
    const title = await window.electronAPI.urlManager.fetchUrlTitle(url); // 변경
    return title;
};

export const nextUrl = async () => {
    const item = await window.electronAPI.urlManager.getNext(); // 변경
    return item;
};

export const clearCompleted = async () => {
    const success = await window.electronAPI.urlManager.clearCompleted();
    return success;
};

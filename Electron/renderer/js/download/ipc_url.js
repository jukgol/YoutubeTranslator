// Electron/renderer/js/runstep/urlHandler.js

export const addUrl = async (url) => {
    // window.electronAPI.urlManagerAddUrl(url)은 이미 구현된 것으로 가정
    const item = await window.electronAPI.urlManagerAddUrl(url);
    return item;
};

export const removeUrl = async (url) => {
    // window.electronAPI.urlManagerRemoveUrl(url)은 이미 구현된 것으로 가정
    const removed = await window.electronAPI.urlManagerRemoveUrl(url);
    return removed;
};

export const updateTitle = async (url) => {
    // 이 함수는 urlManagerFetchUrlTitle를 호출해야 합니다.
    // window.electronAPI.urlManagerFetchUrlTitle(url)은 이미 구현된 것으로 가정
    const title = await window.electronAPI.urlManagerFetchUrlTitle(url);
    return title;
};

export const nextUrl = async () => {
    // window.electronAPI.urlManagerGetNext()는 이미 구현된 것으로 가정
    const item = await window.electronAPI.urlManagerGetNext();
    return item;
};

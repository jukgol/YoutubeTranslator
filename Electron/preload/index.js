const { contextBridge, ipcRenderer } = require('electron');
const path = require('path');

try {
  const loggingAPI = require('./api/logging');
  const pathsAPI = require('./api/paths');
  const settingsAPI = require('./api/settings');
  const systemAPI = require('./api/system');
  const urlManagerAPI = require('./api/urlManager'); // Add this line
  const processAPI = require('./api/process');
  const fsAPI = require('./api/fs'); // Add this line

  const logging = loggingAPI(ipcRenderer);
  const paths = pathsAPI(ipcRenderer);
  const settings = settingsAPI(ipcRenderer);
  const system = systemAPI(ipcRenderer);
  const urlManager = urlManagerAPI(ipcRenderer); // Add this line
  const process = processAPI(ipcRenderer);
  const fs = fsAPI(ipcRenderer); // Add this line

  contextBridge.exposeInMainWorld('electronAPI', {
    logging: logging,
    paths: paths,
    settings: settings,
    system: system,
    urlManager: urlManager,
    process: process,
    python: { // Add this
      runSubtitle: (videoPath, language) => ipcRenderer.invoke('python:run-subtitle', videoPath, language),
      onProgress: (callback) => ipcRenderer.on('python:progress', (event, data) => callback(data))
    },
    fs: fs, // Add this line
    path: { // Expose path functions needed in renderer
      basename: path.basename,
      join: path.join // Add path.join here
    }
  });

  console.log("Electron API 등록 완료");
} catch (e) {
  // 여기서 'module not found'가 뜨면 실제 파일 이름/경로 오타입니다.
  console.error("Preload 로드 에러:", e);
}
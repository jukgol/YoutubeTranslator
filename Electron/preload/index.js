const { contextBridge, ipcRenderer } = require('electron');

try {
  const loggingAPI = require('./api/logging');
  const pathsAPI = require('./api/paths');
  const settingsAPI = require('./api/settings');
  const systemAPI = require('./api/system');
  const urlManagerAPI = require('./api/urlManager'); // Add this line

  const logging = loggingAPI(ipcRenderer);
  const paths = pathsAPI(ipcRenderer);
  const settings = settingsAPI(ipcRenderer);
  const system = systemAPI(ipcRenderer);
  const urlManager = urlManagerAPI(ipcRenderer); // Add this line

  contextBridge.exposeInMainWorld('electronAPI', {
    logging: logging,
    paths: paths,
    settings: settings,
    system: system,
    urlManager: urlManager
  });
  
  console.log("Electron API 등록 완료");
} catch (e) {
  // 여기서 'module not found'가 뜨면 실제 파일 이름/경로 오타입니다.
  console.error("Preload 로드 에러:", e);
}
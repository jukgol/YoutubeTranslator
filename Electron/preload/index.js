const { contextBridge, ipcRenderer } = require('electron');

try {
  const loggingAPI = require('./api/logging'); // .js 추가
  const pathsAPI = require('./api/paths');     // .js 추가
  const settingsAPI = require('./api/settings'); // .js 추가
  const systemAPI = require('./api/system');     // .js 추가

  const logging = loggingAPI(ipcRenderer);
  const paths = pathsAPI(ipcRenderer);
  const settings = settingsAPI(ipcRenderer);
  const system = systemAPI(ipcRenderer);

  contextBridge.exposeInMainWorld('electronAPI', {
    ...logging,
    ...paths,
    ...settings,
    ...system
  });
  
  console.log("Electron API 등록 완료");
} catch (e) {
  // 여기서 'module not found'가 뜨면 실제 파일 이름/경로 오타입니다.
  console.error("Preload 로드 에러:", e);
}
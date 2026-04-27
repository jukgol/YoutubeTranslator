export class EnvUI {
    constructor() {
        this.videoDirInput = document.getElementById('videoDirInput');
        this.apiFileNameInput = document.getElementById('apiFileNameInput');
        this.ruleFileNameInput = document.getElementById('ruleFileNameInput');
        this.geminiVerFileNameInput = document.getElementById('geminiVerFileNameInput');
        this.cookieFileNameInput = document.getElementById('cookieFileNameInput');
        this.initDataFileNameInput = document.getElementById('initDataFileNameInput');
        this.saveEnvSettingsBtn = document.getElementById('saveEnvSettingsBtn');
    }

    async loadEnvUI() {
        // Re-select elements if they weren't found during construction (due to timing)
        this._refreshElements();

        if (window.electronAPI && window.electronAPI.paths) {
            try {
                const data = await window.electronAPI.paths.getFilepathData();
                if (data) {
                    if (this.videoDirInput) this.videoDirInput.value = data.videoDir || '';
                    if (this.apiFileNameInput) this.apiFileNameInput.value = data.apiFile || '';
                    if (this.ruleFileNameInput) this.ruleFileNameInput.value = data.ruleFile || '';
                    if (this.geminiVerFileNameInput) this.geminiVerFileNameInput.value = data.geminiVerFile || '';
                    if (this.cookieFileNameInput) this.cookieFileNameInput.value = data.cookieFile || '';
                    if (this.initDataFileNameInput) this.initDataFileNameInput.value = data.initDataFile || '';
                }
            } catch (error) {
                console.error('Error in loadEnvUI:', error);
                throw error; // Re-throw to be caught by uiManager
            }
        }
    }

    initEnvHandlers() {
        this._refreshElements();

        if (this.saveEnvSettingsBtn) {
            this.saveEnvSettingsBtn.addEventListener('click', async () => {
                const newData = {
                    videoDir: this.videoDirInput ? this.videoDirInput.value : '',
                    apiFile: this.apiFileNameInput ? this.apiFileNameInput.value : '',
                    ruleFile: this.ruleFileNameInput ? this.ruleFileNameInput.value : '',
                    geminiVerFile: this.geminiVerFileNameInput ? this.geminiVerFileNameInput.value : '',
                    cookieFile: this.cookieFileNameInput ? this.cookieFileNameInput.value : '',
                    initDataFile: this.initDataFileNameInput ? this.initDataFileNameInput.value : ''
                };

                if (window.electronAPI && window.electronAPI.paths) {
                    const success = await window.electronAPI.paths.setFilepathData(newData);
                    if (success) {
                        alert('환경 설정이 저장되었습니다. 일부 변경 사항은 프로그램 재시작 후 적용될 수 있습니다.');
                    } else {
                        alert('환경 설정 저장에 실패했습니다.');
                    }
                }
            });
        }
    }

    _refreshElements() {
        if (!this.videoDirInput) this.videoDirInput = document.getElementById('videoDirInput');
        if (!this.apiFileNameInput) this.apiFileNameInput = document.getElementById('apiFileNameInput');
        if (!this.ruleFileNameInput) this.ruleFileNameInput = document.getElementById('ruleFileNameInput');
        if (!this.geminiVerFileNameInput) this.geminiVerFileNameInput = document.getElementById('geminiVerFileNameInput');
        if (!this.cookieFileNameInput) this.cookieFileNameInput = document.getElementById('cookieFileNameInput');
        if (!this.initDataFileNameInput) this.initDataFileNameInput = document.getElementById('initDataFileNameInput');
        if (!this.saveEnvSettingsBtn) this.saveEnvSettingsBtn = document.getElementById('saveEnvSettingsBtn');
    }
}

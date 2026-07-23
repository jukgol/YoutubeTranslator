// Electron/renderer/js/download/section/downloadSection.js

import { addUrl } from '../ipc_url.js'; // 경로 수정
import { addFlatListItem } from '../listRenderers.js'; // 경로 수정
import { createItemClickHandler } from '../selectionHandler.js'; // 경로 수정
import { parseUrlsFromTextFile } from '../textFileParser.js';

export class DownloadSection {
    constructor(sectionElement, completeSection) {
        this.sectionElement = sectionElement;
        this.completeSection = completeSection; // Store the instance
        this.addUrlButton = sectionElement.querySelector('#add-url-button');
        this.addTextButton = sectionElement.querySelector('#add-text-button');
        this.textFileInput = sectionElement.querySelector('#text-file-input');
        this.startDownloadButton = sectionElement.querySelector('#start-download-button');
        this.urlInput = sectionElement.querySelector('#url-input');
        this.downloadUrlList = sectionElement.querySelector('#downloadUrlList');
        this.clearQueueButton = sectionElement.querySelector('#clear-queue-button'); // 큐 비우기 버튼 참조 추가
        this.handleItemClick = createItemClickHandler();
        this.setupEventListeners();
        this.initialRender();
        this.setupIPCListeners(); // IPC 리스너 설정 추가
    }

    // 아이템 업데이트를 UI에 반영하는 헬퍼 메서드
    updateItemDisplay(itemData) {
        const { id, title, status } = itemData;
        const listItem = this.downloadUrlList.querySelector(`li[data-id="${id}"]`);

        if (listItem) {
            if (status === '완료') {
                // Move to completed section
                listItem.remove();
                if (this.completeSection) {
                    this.completeSection.addItem(itemData);
                }
            } else if (status === '다운로드 중') {
                listItem.style.backgroundColor = '#A7F3D0'; // Light green
                listItem.textContent = `ID: ${id}, 제목: ${title}, 상태: ${status}`;
            } else {
                // Just update the text for other statuses
                listItem.textContent = `ID: ${id}, 제목: ${title}, 상태: ${status}`;
            }
            console.log(`[UI 업데이트] ID: ${id}, 제목: ${title}, 상태: ${status}`);
        }
    }

    setupEventListeners() {
        if (this.addUrlButton && this.urlInput && this.downloadUrlList) {
            this.addUrlButton.addEventListener('click', async () => {
                console.log('URL 추가 버튼 클릭됨 (DownloadSection)');
                const rawInput = this.urlInput.value.trim();
                if (rawInput) {
                    this.addUrlButton.disabled = true;

                    // URL 정규식 추출 또는 공백/줄바꿈/콤마 단위로 개별 URL 분리
                    let urls = rawInput.match(/https?:\/\/[^\s"',;]+/gi);
                    if (!urls || urls.length === 0) {
                        urls = rawInput
                            .split(/[\r\n\s,;]+/)
                            .map(url => url.trim())
                            .filter(url => url.length > 0);
                    }

                    for (const url of urls) {
                        const newItem = await addUrl(url);
                        if (newItem) {
                            console.log('URL 추가 완료:', newItem);
                            addFlatListItem(this.downloadUrlList, newItem, '영상 다운로드', this.handleItemClick);
                        }
                    }

                    this.urlInput.value = '';
                    this.addUrlButton.disabled = false;
                } else {
                    console.log('URL이 비어 있습니다.');
                }
            });
        }

        if (this.addTextButton && this.textFileInput && this.downloadUrlList) {
            this.addTextButton.addEventListener('click', () => {
                this.textFileInput.value = '';
                this.textFileInput.click();
            });

            this.textFileInput.addEventListener('change', async (event) => {
                const file = event.target.files[0];
                if (!file) return;

                try {
                    const lines = await parseUrlsFromTextFile(file);
                    if (lines.length === 0) return;

                    this.addTextButton.disabled = true;
                    for (const url of lines) {
                        const newItem = await addUrl(url);
                        if (newItem) {
                            console.log('Text 파일 내 URL 추가 완료:', newItem);
                            addFlatListItem(this.downloadUrlList, newItem, '영상 다운로드', this.handleItemClick);
                        }
                    }
                } catch (error) {
                    console.error('Text 파일 처리 중 오류 발생:', error);
                } finally {
                    this.addTextButton.disabled = false;
                }
            });
        }

        if (this.clearQueueButton) {
            this.clearQueueButton.addEventListener('click', async () => {
                const confirmed = confirm('다운로드 대기 목록을 모두 지우시겠습니까?');
                if (confirmed) {
                    await this.clearQueue();
                }
            });
        }
        if (this.startDownloadButton) {
            this.startDownloadButton.addEventListener('click', async () => {
                console.log('다운로드 시작 버튼 클릭됨');

                const qualitySelect = document.getElementById('quality-select');
                const quality = qualitySelect ? qualitySelect.value : 'best';

                const subtitleCheckbox = document.getElementById('subtitle-checkbox');
                const downloadSubs = subtitleCheckbox ? subtitleCheckbox.checked : false;

                console.log(`선택된 화질: ${quality}, 자막 다운로드 여부: ${downloadSubs}`);

                this.startDownloadButton.disabled = true;
                this.startDownloadButton.textContent = '다운로드 중...';

                await window.electronAPI.urlManager.startDownload(quality, downloadSubs); // 자막 여부 추가 전달

                this.startDownloadButton.disabled = false;
                this.startDownloadButton.textContent = '다운로드 시작';
                console.log('모든 다운로드 작업 완료됨');
            });
        }
    }

    async clearQueue() {
        console.log('큐 비우기 실행');
        this.downloadUrlList.innerHTML = '';
        try {
            if (window.electronAPI && window.electronAPI.urlManager && window.electronAPI.urlManager.clearUrlList) {
                await window.electronAPI.urlManager.clearUrlList();
                console.log('큐 비우기 완료');
            }
        } catch (error) {
            console.error('큐 비우기 실패:', error);
        }
    }

    async initialRender() {
        // this.render(); // Assuming a render method exists or will be added
        // 설정 로드 및 적용
        try {
            if (window.electronAPI && window.electronAPI.urlManager && window.electronAPI.urlManager.getDownloadSettings) {
                const settings = await window.electronAPI.urlManager.getDownloadSettings();
                if (settings) {
                    const qualitySelect = document.getElementById('quality-select');
                    const subtitleCheckbox = document.getElementById('subtitle-checkbox');

                    if (qualitySelect) {
                        if (settings.quality) qualitySelect.value = settings.quality;

                        // 변경 시 자동 저장
                        qualitySelect.addEventListener('change', async () => {
                            const currentSettings = {
                                quality: qualitySelect.value,
                                downloadSubs: subtitleCheckbox ? subtitleCheckbox.checked : false
                            };
                            await window.electronAPI.urlManager.saveDownloadSettings(currentSettings);
                            console.log('설정 저장됨 (화질 변경):', currentSettings);
                        });
                    }

                    if (subtitleCheckbox) {
                        if (settings.downloadSubs !== undefined) subtitleCheckbox.checked = settings.downloadSubs;

                        // 변경 시 자동 저장
                        subtitleCheckbox.addEventListener('change', async () => {
                            const currentSettings = {
                                quality: qualitySelect ? qualitySelect.value : 'best',
                                downloadSubs: subtitleCheckbox.checked
                            };
                            await window.electronAPI.urlManager.saveDownloadSettings(currentSettings);
                            console.log('설정 저장됨 (자막 변경):', currentSettings);
                        });
                    }
                    console.log('다운로드 설정 로드 완료:', settings);
                }
            }
        } catch (error) {
            console.error('설정 로드 실패:', error);
        }
        // 초기 로드 시 기존에 추가된 downloadItems (가정)을 렌더링하는 로직이 있었으나,
        // 이제 downloadItems 배열이 없어졌으므로, 이 부분은 메인 프로세스에
        // 저장된 목록을 요청하는 방식으로 변경되어야 합니다.
        // 현재는 초기 로드 시에는 아무것도 렌더링하지 않습니다。
        // 추후 메인 프로세스에서 전체 대기열 목록을 가져오는 API가 필요할 수 있습니다.
    }

    setupIPCListeners() { // IPC 리스너 설정 메서드 추가
        if (window.electronAPI && window.electronAPI.urlManager && window.electronAPI.urlManager.onUpdateItem) {
            window.electronAPI.urlManager.onUpdateItem((itemData) => {
                this.updateItemDisplay(itemData);
            });
        }
    }
}

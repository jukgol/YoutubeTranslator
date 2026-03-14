// Electron/renderer/js/download/section/addListSection.js

import { addUrl } from '../ipc_url.js';
import { addFlatListItem } from '../listRenderers.js';
import { createItemClickHandler } from '../selectionHandler.js';

export class AddListSection {
    constructor(sectionElement) {
        this.sectionElement = sectionElement;
        this.urlInput = sectionElement.querySelector('#add-list-url-input');
        this.addButton = sectionElement.querySelector('#add-to-list-button');
        this.videoAddList = sectionElement.querySelector('#videoAddList');
        
        this.startDownloadButton = sectionElement.querySelector('#add-list-start-download-button');
        this.stopDownloadButton = sectionElement.querySelector('#add-list-stop-download-button');
        this.deleteSelectedButton = sectionElement.querySelector('#add-list-delete-selected-button');
        this.clearQueueButton = sectionElement.querySelector('#add-list-clear-queue-button');

        this.handleItemClick = createItemClickHandler();
        this.setupEventListeners();
        this.setupIPCListeners();
    }

    // 아이템 업데이트를 UI에 반영하는 헬퍼 메서드
    updateItemDisplay(itemData) {
        const { id, title, status } = itemData;
        const listItem = this.videoAddList.querySelector(`li[data-id="${id}"]`);

        if (listItem) {
            listItem.textContent = `ID: ${id}, 제목: ${title}, 상태: ${status}`;
            if (status === '다운로드 중') {
                listItem.style.backgroundColor = '#A7F3D0'; // Light green
            } else if (status === '완료') {
                listItem.style.backgroundColor = '#E5E7EB'; // Light gray
            } else if (status === '실패') {
                listItem.style.backgroundColor = '#FCA5A5'; // Light red
            }
            console.log(`[섹션0 UI 업데이트] ID: ${id}, 제목: ${title}, 상태: ${status}`);
        }
    }

    setupEventListeners() {
        if (this.addButton && this.urlInput && this.videoAddList) {
            this.addButton.addEventListener('click', async () => {
                const url = this.urlInput.value.trim();
                if (url) {
                    this.addButton.disabled = true;
                    this.addButton.textContent = '분석 중...';

                    const isPlaylist = url.includes('list=');

                    if (isPlaylist && window.electronAPI.urlManager.fetchPlaylistUrls) {
                        try {
                            const entries = await window.electronAPI.urlManager.fetchPlaylistUrls(url);
                            if (entries && entries.length > 0) {
                                for (const entry of entries) {
                                    const newItem = await addUrl(entry.url);
                                    if (newItem) {
                                        addFlatListItem(this.videoAddList, newItem, '영상 리스트 추가', this.handleItemClick);
                                    }
                                }
                            } else {
                                alert('플레이리스트 분석 실패');
                            }
                        } catch (error) {
                            console.error('플레이리스트 처리 중 오류:', error);
                        }
                    } else {
                        const newItem = await addUrl(url);
                        if (newItem) {
                            addFlatListItem(this.videoAddList, newItem, '영상 리스트 추가', this.handleItemClick);
                        }
                    }

                    this.urlInput.value = '';
                    this.addButton.disabled = false;
                    this.addButton.textContent = '추가';
                }
            });
        }

        if (this.startDownloadButton) {
            this.startDownloadButton.addEventListener('click', async () => {
                const quality = document.getElementById('quality-select')?.value || 'best';
                const downloadSubs = document.getElementById('subtitle-checkbox')?.checked || false;

                this.setDownloadingState(true);
                await window.electronAPI.urlManager.startDownload(quality, downloadSubs);
                this.setDownloadingState(false);
            });
        }

        if (this.stopDownloadButton) {
            this.stopDownloadButton.addEventListener('click', async () => {
                this.stopDownloadButton.disabled = true;
                this.stopDownloadButton.textContent = '중지 중...';
                await window.electronAPI.urlManager.cancelDownload();
            });
        }

        if (this.deleteSelectedButton) {
            this.deleteSelectedButton.addEventListener('click', async () => {
                const selectedItem = this.videoAddList.querySelector('li.selected');
                if (selectedItem) {
                    try {
                        const itemData = JSON.parse(selectedItem.dataset.data);
                        const url = itemData.url;
                        
                        const removed = await window.electronAPI.urlManager.removeUrl(url);
                        if (removed) {
                            selectedItem.remove();
                            // 만약 목록이 비었다면 "No files found." 다시 표시 (필요 시)
                            if (this.videoAddList.querySelector('ul').children.length === 0) {
                                this.videoAddList.querySelector('ul').innerHTML = '<li style="color: #888; padding: 10px; text-align: center; font-style: italic;">No files found.</li>';
                            }
                        } else {
                            alert('삭제에 실패했거나 대기 목록에 없는 항목입니다.');
                        }
                    } catch (error) {
                        console.error('삭제 처리 중 오류:', error);
                    }
                } else {
                    alert('삭제할 항목을 먼저 선택해주세요.');
                }
            });
        }

        if (this.clearQueueButton) {
            this.clearQueueButton.addEventListener('click', async () => {
                if (confirm('대기 목록을 모두 지우시겠습니까?')) {
                    this.videoAddList.innerHTML = '';
                    await window.electronAPI.urlManager.clearUrlList();
                }
            });
        }
    }

    setDownloadingState(isDownloading) {
        if (isDownloading) {
            this.startDownloadButton.style.display = 'none';
            this.stopDownloadButton.style.display = 'inline-block';
            this.stopDownloadButton.disabled = false;
            this.stopDownloadButton.textContent = '다운로드 중지';
            this.addButton.disabled = true;
        } else {
            this.startDownloadButton.style.display = 'inline-block';
            this.stopDownloadButton.style.display = 'none';
            this.addButton.disabled = false;
        }
    }

    setupIPCListeners() {
        if (window.electronAPI?.urlManager?.onUpdateItem) {
            window.electronAPI.urlManager.onUpdateItem((itemData) => {
                this.updateItemDisplay(itemData);
            });
        }
    }
}

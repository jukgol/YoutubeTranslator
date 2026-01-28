// Electron/renderer/js/runall/index.js
import { renderSimpleList } from './listRenderers.js';
import { createItemClickHandler } from './selectionHandler.js';

// 'runall' 탭의 각 섹션에 대한 설정
const pathMapping = {
    '원본 데이터': { api: 'pathGetSubtitleFiles', listElementId: '#runall-content .section-frame:nth-child(1) .list-field' },
    '작업 큐': { api: null, listElementId: '#runall-content .section-frame:nth-child(2) .list-field' },
    '최종 결과': { api: 'pathGetResultFiles', listElementId: '#runall-content .section-frame:nth-child(4) .list-field' },
};

// 버튼 이벤트 리스너를 설정하는 함수
function setupButtonListeners() {
    const originList = document.querySelector(pathMapping['원본 데이터'].listElementId);
    const resultList = document.querySelector(pathMapping['최종 결과'].listElementId);

    const addToQueueBtn = document.getElementById('add-to-queue-btn');
    const clearQueueBtn = document.getElementById('clear-queue-btn');
    const queueStartBtn = document.getElementById('queue-start-btn');
    const queueStopBtn = document.getElementById('queue-stop-btn');
    const statusStopBtn = document.getElementById('status-stop-btn');
    const moveFileBtn = document.getElementById('move-file-btn');

    if (addToQueueBtn && originList) {
        addToQueueBtn.onclick = async () => {
            const selectedItems = Array.from(originList.querySelectorAll('.list-item')).filter(item => item.style.backgroundColor).map(item => item.textContent);
            if (selectedItems.length > 0) {
                console.log('Adding to queue:', selectedItems);
                // await window.electronAPI.invoke('simple:add-to-queue', selectedItems);
                // await initializeRunallTab(); // 목록 새로고침
            }
        };
    }

    if (clearQueueBtn) {
        clearQueueBtn.onclick = async () => {
            console.log('Clearing queue');
            // await window.electronAPI.invoke('simple:clear-queue');
            // await initializeRunallTab();
        };
    }

    if (queueStartBtn) {
        queueStartBtn.onclick = () => console.log('Starting translation'); // window.electronAPI.invoke('simple:start-translation');
    }

    if (queueStopBtn) {
        queueStopBtn.onclick = () => console.log('Stopping translation'); // window.electronAPI.invoke('simple:stop-translation');
    }

    if (statusStopBtn) {
        statusStopBtn.onclick = () => console.log('Stopping translation'); // window.electronAPI.invoke('simple:stop-translation');
    }

    if (moveFileBtn && resultList) {
        moveFileBtn.onclick = async () => {
            const selectedItems = Array.from(resultList.querySelectorAll('.list-item')).filter(item => item.style.backgroundColor).map(item => item.textContent);
            if (selectedItems.length > 0) {
                console.log('Copying file:', selectedItems);
                // await window.electronAPI.invoke('simple:copy-file', selectedItems);
            }
        };
    }
}

// Runall 탭이 활성화될 때 호출되는 주 함수
export async function initializeRunallTab() {
    console.log('[RunallTab] Initializing...');

    const handleItemClick = createItemClickHandler();

    // 각 섹션의 파일 목록을 비동기적으로 로드하고 렌더링
    for (const sectionName in pathMapping) {
        const config = pathMapping[sectionName];
        if (config.api) {
            const listElement = document.querySelector(config.listElementId);
            if (listElement) {
                try {
                    const data = await window.electronAPI[config.api]();
                    renderSimpleList(listElement, data, sectionName, handleItemClick);
                } catch (error) {
                    console.error(`[RunallTab] Error fetching data for ${sectionName}:`, error);
                    listElement.innerHTML = `<p style="color: red;">데이터 로딩 실패</p>`;
                }
            }
        }
    }

    // 버튼 리스너 설정 (한 번만 실행되도록)
    if (!window.runallTabInitialized) {
        setupButtonListeners();
        window.runallTabInitialized = true;
    }
}
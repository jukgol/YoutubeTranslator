import { renderSimpleList } from './listRenderers.js'; 
import { setupQueueButtons } from './setupQueueButtons.js';
import { setupResultButtons } from './setupResultButtons.js';

// 섹션별 선택 상태 저장용 금고 (독립 선택 보장)
const runallSelectedMap = new Map();

/**
 * 섹션별 선택 관리 핸들러
 */
const handleRunallSelection = (clickedElement, sectionName, data) => {
    const previousSelected = runallSelectedMap.get(sectionName);

    // 같은 섹션 내에서만 이전 선택을 지움
    if (previousSelected && previousSelected !== clickedElement) {
        previousSelected.classList.remove('selected');
    }

    clickedElement.classList.add('selected');
    runallSelectedMap.set(sectionName, clickedElement);
    clickedElement.dataset.data = JSON.stringify(data);
};

// 설정 객체
const pathMapping = {
    '원본 데이터': { api: 'getSubtitleFiles', selector: '#runall-content .section-frame:nth-child(1) .list-field' }, // 변경
    '최종 결과': { api: 'getResultFiles', selector: '#runall-content .section-frame:nth-child(4) .list-field' },    // 변경
    '작업 큐': { api: null, selector: '#runall-content .section-frame:nth-child(2) .list-field' }
};

export async function initializeRunallTab() {
    console.log('[RunallTab] 초기화 시작...');

    try {
        for (const [name, config] of Object.entries(pathMapping)) {
            if (!config.api) continue;

            const listElement = document.querySelector(config.selector);
            if (!listElement) continue;

            // 데이터 로드
            const data = await window.electronAPI.paths[config.api]();

            // 리스트 렌더링 (핸들러에 섹션 이름을 박아서 전달)
            renderSimpleList(listElement, data, name, (clickedEl) => {
                handleRunallSelection(clickedEl, name, clickedEl.textContent);
            });
        }

        // 버튼 초기화 (Map을 넘겨줌)
        if (!window.runallTabInitialized) {
            setupQueueButtons(pathMapping, runallSelectedMap);
            setupResultButtons(pathMapping, runallSelectedMap);
            window.runallTabInitialized = true;
        }
    } catch (error) {
        console.error('[RunallTab] 초기화 중 치명적 에러:', error);
    }
}
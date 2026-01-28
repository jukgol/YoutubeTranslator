import { startSimulation, stopSimulation } from './processSimulator.js';

export function setupQueueButtons(pathMapping, selectedMap) {
    const queueListElement = document.getElementById('queue-list');
    // videoListElement는 선택 해제를 위해 필요할 수 있지만, 현재 로직에서는 selectedMap에서 관리하므로 직접 접근 필요 없음.

    const actions = {
        'add-to-queue-btn': () => {
            const selectedOriginalItem = selectedMap.get('원본 데이터');
            if (!selectedOriginalItem) {
                alert('원본 데이터를 선택하세요.');
                return;
            }

            // 선택된 항목을 복제하고 'selected' 클래스 제거
            const itemToQueue = selectedOriginalItem.cloneNode(true);
            itemToQueue.classList.remove('selected');
            // ID 중복 방지 (필요하다면)
            itemToQueue.id = '';

            queueListElement.appendChild(itemToQueue);

            // 큐에 추가한 후 원본 목록에서 선택 해제
            selectedOriginalItem.classList.remove('selected');
            selectedMap.delete('원본 데이터');

            console.log('큐에 추가됨:', itemToQueue.textContent);
        },
        'clear-queue-btn': () => {
            stopSimulation(); // 큐를 지우기 전에 진행 중인 시뮬레이션 중지
            queueListElement.innerHTML = ''; // 큐의 모든 항목 지우기
            console.log('큐 비우기');
        },
        'queue-start-btn': () => {
            console.log('번역 시작');
            startSimulation(queueListElement);
        },
        'queue-stop-btn': () => {
            console.log('번역 중단');
            stopSimulation();
        }
    };

    Object.entries(actions).forEach(([id, callback]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = callback;
    });
}
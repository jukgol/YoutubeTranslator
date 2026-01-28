let currentTimeout = null;
let currentProcessingIndex = -1;
let queueItems = [];
let queueList = null;

function resetSimulation() {
    if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
    }
    if (queueItems[currentProcessingIndex]) {
        queueItems[currentProcessingIndex].classList.remove('active-process');
    }
    currentProcessingIndex = -1;
    queueItems = [];
    queueList = null;
}

export function startSimulation(listElement) {
    resetSimulation(); // 이전 시뮬레이션이 있다면 초기화
    queueList = listElement;
    queueItems = Array.from(queueList.children);

    if (queueItems.length === 0) {
        console.log('작업 큐가 비어 있습니다.');
        return;
    }

    const processNextItem = () => {
        // 이전 항목의 active-process 클래스 제거
        if (currentProcessingIndex >= 0) {
            queueItems[currentProcessingIndex].classList.remove('active-process');
        }

        currentProcessingIndex++;

        // 모든 항목 처리 완료
        if (currentProcessingIndex >= queueItems.length) {
            console.log('모든 항목 처리 완료.');
            resetSimulation();
            return;
        }

        const currentItem = queueItems[currentProcessingIndex];
        currentItem.classList.add('active-process');
        console.log(`[시뮬레이션] 처리 중: ${currentItem.textContent}`);

        currentTimeout = setTimeout(processNextItem, 2000);
    };

    processNextItem(); // 첫 항목 처리 시작
}

export function stopSimulation() {
    console.log('[시뮬레이션] 중지 요청됨.');
    resetSimulation();
}

export function setupQueueButtons(pathMapping, selectedMap) {
    const actions = {
        'add-to-queue-btn': () => {
            const selectedEl = selectedMap.get('원본 데이터');
            if (!selectedEl) return alert('원본 데이터를 선택하세요.');

            const data = JSON.parse(selectedEl.dataset.data);
            console.log('큐에 추가:', data);
        },
        'clear-queue-btn': () => console.log('큐 비우기'),
        'queue-start-btn': () => console.log('번역 시작'),
        'queue-stop-btn': () => console.log('번역 중단')
    };

    Object.entries(actions).forEach(([id, callback]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = callback; // addEventListener 대신 확실한 교체
    });
}
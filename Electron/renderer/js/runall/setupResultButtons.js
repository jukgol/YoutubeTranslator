export function setupResultButtons(pathMapping, selectedMap) {
    const actions = {
        'move-file-btn': () => {
            const selectedEl = selectedMap.get('최종 결과');
            if (!selectedEl) return alert('이동할 결과 파일을 선택하세요.');

            const data = JSON.parse(selectedEl.dataset.data);
            console.log('파일 이동:', data);
        },
        'status-stop-btn': () => console.log('중단')
    };

    Object.entries(actions).forEach(([id, callback]) => {
        const btn = document.getElementById(id);
        if (btn) btn.onclick = callback;
    });
}
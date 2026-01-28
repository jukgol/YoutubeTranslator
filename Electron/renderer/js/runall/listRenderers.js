// Electron/renderer/js/basic/listRenderers.js
export function renderSimpleList(listContainer, data, sectionName, handleItemClick) {
    listContainer.innerHTML = ''; // 기존 콘텐츠 초기화

    if (!data || data.length === 0) {
        const p = document.createElement('p');
        p.textContent = '항목 없음';
        p.style.textAlign = 'center';
        p.style.color = '#9CA3AF';
        listContainer.appendChild(p);
        return;
    }

    data.forEach(itemText => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item'; // 스타일링을 위한 클래스
        itemDiv.textContent = itemText;
        
        // 아이템에 클릭 이벤트 리스너 추가
        if (handleItemClick) {
            itemDiv.addEventListener('click', () => handleItemClick(itemDiv));
        }
        
        listContainer.appendChild(itemDiv);
    });
}

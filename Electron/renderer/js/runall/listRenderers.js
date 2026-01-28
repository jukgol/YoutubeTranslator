// Electron/renderer/js/basic/listRenderers.js
export function renderSimpleList(listContainer, data, sectionName, handleItemClick) {
    listContainer.innerHTML = ''; // 기존 콘텐츠 초기화

    if (!data || data.length === 0) {
        const li = document.createElement('li');
        li.className = 'list-item-empty';
        li.textContent = '항목 없음';
        listContainer.appendChild(li);
        return;
    }

    data.forEach(itemText => {
        const li = document.createElement('li'); // Changed from div to li
        li.className = 'list-item'; // 스타일링을 위한 클래스
        li.textContent = itemText;
        
        // 아이템에 클릭 이벤트 리스너 추가
        if (handleItemClick) {
            li.addEventListener('click', () => handleItemClick(li)); // Pass li
        }
        
        listContainer.appendChild(li);
    });
}

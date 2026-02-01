// Electron/renderer/js/subtitle/listRenderers.js

export function renderFlatList(listFieldElement, files, sectionName, handleItemClick) {
    // 1. 부모 내부의 ul을 찾거나 없으면 새로 생성 (HTML 유지)
    let ul = listFieldElement.querySelector('ul');

    if (!ul) {
        listFieldElement.innerHTML = ''; // Clear any existing placeholders (like divs)
        ul = document.createElement('ul');
        ul.className = 'item-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        listFieldElement.appendChild(ul);
    }

    // 2. 부모가 아닌 ul 내부만 초기화
    ul.innerHTML = '';

    if (files.length === 0) {
        ul.innerHTML = '<li style="color: #888; padding: 10px; text-align: center;">대기중인 항목이 없습니다.</li>';
        return;
    }

    // 3. 전체 리스트 렌더링
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        li.className = 'list-item';
        li.dataset.type = 'file';
        li.dataset.sectionName = sectionName;
        li.dataset.data = JSON.stringify(file);
        if (handleItemClick) {
            li.onclick = () => handleItemClick(li, 'file', sectionName, file);
        }
        ul.appendChild(li);
    });
}

// 새로운 함수: 단일 아이템 추가 (기존 구조를 유지하며 append)
export function addFlatListItem(listFieldElement, itemData, sectionName, handleItemClick) {
    let ul = listFieldElement.querySelector('ul');

    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'item-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        listFieldElement.innerHTML = ''; // 텍스트 메시지 등이 있다면 제거
        listFieldElement.appendChild(ul);
    }

    // "No files found" 메시지가 li 형태로 있다면 제거
    const emptyMsg = ul.querySelector('li');
    if (emptyMsg && emptyMsg.textContent === 'No files found.') {
        ul.innerHTML = '';
    }

    const { id, title, status } = itemData;

    const li = document.createElement('li');
    li.textContent = `ID: ${id}, 제목: ${title}, 상태: ${status}`;
    li.className = 'list-item';
    li.dataset.id = id;
    li.dataset.type = 'file';
    li.dataset.sectionName = sectionName;
    li.dataset.data = JSON.stringify(itemData);
    if (handleItemClick) {
        li.onclick = () => handleItemClick(li, 'file', sectionName, itemData);
    }

    // 4. 기존 내용을 유지하며 하나만 추가
    ul.appendChild(li);
}

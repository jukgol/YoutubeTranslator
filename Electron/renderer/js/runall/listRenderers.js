// Electron/renderer/js/runall/listRenderers.js

export function renderFlatList(listFieldElement, files, sectionName) {
    // 1. 부모 안에서 ul을 찾거나 없으면 생성 (HTML에 이미 있으면 그걸 씀)
    let ul = listFieldElement.querySelector('ul');

    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'item-list';
        // HTML에 없을 때만 예외적으로 ID 부여
        ul.id = `${sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-list`;
        listFieldElement.appendChild(ul);
    }

    // 2. 부모(listFieldElement)가 아닌 ul의 내부(li들)만 초기화
    ul.innerHTML = '';

    // 3. 데이터가 없을 경우
    if (files.length === 0) {
        const noFileLi = document.createElement('li');
        noFileLi.style.cssText = "color: #888; padding: 10px; text-align: center; font-style: italic;";
        noFileLi.textContent = 'No files found.';
        ul.appendChild(noFileLi);
        return;
    }

    // 4. 공통 스타일 보정 (이미 CSS에 있다면 생략 가능)
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';

    // 5. 아이템 추가 (append)
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        li.className = 'list-item';
        li.dataset.type = 'file';
        li.dataset.sectionName = sectionName;
        li.dataset.data = JSON.stringify(file);
        ul.appendChild(li);
    });
}
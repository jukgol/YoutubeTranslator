// Electron/renderer/js/download/listRenderers.js

export function renderFlatList(listFieldElement, files, sectionName, handleItemClick) {
    listFieldElement.innerHTML = ''; // Clear existing content
    if (files.length === 0) {
        listFieldElement.innerHTML = '<div style="color: #888; padding: 10px; text-align: center; font-style: italic;">No files found.</div>';
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    files.forEach(file => {
        const li = document.createElement('li');
        li.textContent = file;
        li.className = 'list-item'; // Apply CSS class
        li.dataset.type = 'file'; // Set dataset type
        li.dataset.sectionName = sectionName; // Set dataset sectionName
        li.dataset.data = JSON.stringify(file); // Store actual data
        li.onclick = () => handleItemClick(li, 'file', sectionName, file);
            ul.appendChild(li);
        });
            listFieldElement.appendChild(ul);
        }
        
        // 새로운 함수: 단일 아이템 추가
        export function addFlatListItem(listFieldElement, itemData, sectionName, handleItemClick) {
            let ul = listFieldElement.querySelector('ul');
            // ul이 없으면 새로 생성 (renderFlatList가 호출되지 않은 경우)
            if (!ul) {
                ul = document.createElement('ul');
                ul.style.listStyle = 'none';
                ul.style.padding = '0';
                ul.style.margin = '0';
                listFieldElement.innerHTML = ''; // 기존 'No files found.' 메시지 제거
                listFieldElement.appendChild(ul);
            }
        
            const li = document.createElement('li');
            li.textContent = itemData; // 단일 아이템 텍스트 설정
            li.className = 'list-item'; // Apply CSS class
            li.dataset.type = 'file'; // Set dataset type
            li.dataset.sectionName = sectionName; // Set dataset sectionName
            li.dataset.data = JSON.stringify(itemData); // Store actual data
            li.onclick = () => handleItemClick(li, 'file', sectionName, itemData);
            ul.appendChild(li);
        }

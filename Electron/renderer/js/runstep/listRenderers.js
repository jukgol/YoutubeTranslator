// Electron/renderer/js/runstep/listRenderers.js

export function renderFlatList(listFieldElement, files, sectionName) {
    // 1. 기존 ul 찾기 또는 생성
    let ul = listFieldElement.querySelector('ul');
    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'item-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        listFieldElement.appendChild(ul);
    }

    // 2. 내부만 비우기
    ul.innerHTML = '';

    if (files.length === 0) {
        ul.innerHTML = '<li style="color: #888; padding: 10px; text-align: center; font-style: italic;">No files found.</li>';
        return;
    }

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

export function renderNestedList(listFieldElement, data, sectionName) {
    // 1. 기존 ul 찾기 또는 생성
    let ul = listFieldElement.querySelector('ul');
    if (!ul) {
        ul = document.createElement('ul');
        ul.className = 'item-list';
        ul.style.listStyle = 'none';
        ul.style.padding = '0';
        ul.style.margin = '0';
        listFieldElement.appendChild(ul);
    }

    // 2. 내부만 비우기
    ul.innerHTML = '';

    const folderNames = Object.keys(data).sort();

    if (folderNames.length === 0) {
        ul.innerHTML = '<li style="color: #888; padding: 10px; text-align: center; font-style: italic;">No folders found.</li>';
        return;
    }

    folderNames.forEach(folder => {
        const folderLi = document.createElement('li');
        folderLi.className = 'list-item';
        folderLi.dataset.type = 'folder';
        folderLi.dataset.sectionName = sectionName;
        folderLi.dataset.data = JSON.stringify(folder);
        
        const folderSpan = document.createElement('span');
        folderSpan.textContent = `📁 ${folder}`;
        folderSpan.className = 'list-item-folder';
        folderLi.appendChild(folderSpan);

        const files = data[folder] || [];
        if (files.length > 0) {
            const fileUl = document.createElement('ul');
            fileUl.style.listStyle = 'none';
            fileUl.style.padding = '0';
            fileUl.style.margin = '0';
            fileUl.style.paddingLeft = '20px';
            files.forEach(file => {
                const li = document.createElement('li');
                let displayFile = file.includes('_Part') 
                    ? `└─ ${file.substring(file.indexOf('Part'))}` 
                    : `└─ ${file}`;
                
                li.textContent = displayFile;
                li.className = 'list-item';
                li.dataset.type = 'file';
                li.dataset.sectionName = sectionName;
                li.dataset.data = JSON.stringify(file);
                fileUl.appendChild(li);
            });
            folderLi.appendChild(fileUl);
        } else {
             const noFileLi = document.createElement('li');
             noFileLi.textContent = '└─ No files';
             noFileLi.style.paddingLeft = '20px';
             noFileLi.className = 'list-item-empty';
             noFileLi.dataset.type = 'no-files';
             folderLi.appendChild(noFileLi);
        }
        ul.appendChild(folderLi);
    });
}
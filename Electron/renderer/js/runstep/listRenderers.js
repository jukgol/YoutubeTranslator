// Electron/renderer/js/detail/listRenderers.js

export function renderFlatList(listFieldElement, files, sectionName, handleItemClick) { // Added handleItemClick
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
        li.onclick = () => handleItemClick(li, 'file', sectionName, file); // Attach click handler
        ul.appendChild(li);
    });
    listFieldElement.appendChild(ul);
}

export function renderNestedList(listFieldElement, data, sectionName, handleItemClick) { // Added handleItemClick
    listFieldElement.innerHTML = ''; // Clear existing content

    const folderNames = Object.keys(data).sort(); // Sort folders alphabetically

    if (folderNames.length === 0) {
        listFieldElement.innerHTML = '<div style="color: #888; padding: 10px; text-align: center; font-style: italic;">No folders found.</div>';
        return;
    }

    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';

    folderNames.forEach(folder => {
        const folderLi = document.createElement('li');
        folderLi.className = 'list-item'; // ADDED: Apply list-item class to folder LI
        folderLi.dataset.type = 'folder'; // Set dataset type
        folderLi.dataset.sectionName = sectionName; // Set dataset sectionName
        folderLi.dataset.data = JSON.stringify(folder); // Store actual data
        folderLi.onclick = (event) => {
            // If the actual target clicked is the span within the folderLi, pass the folderLi for highlighting
            if (event.target.tagName === 'SPAN' && event.target.closest('li[data-type="folder"]') === folderLi) {
                 handleItemClick(folderLi, 'folder', sectionName, folder);
            } else {
                 // If clicked on fileUl within folderLi, we still want folderLi to be the elementToHighlight
                 handleItemClick(event.target, 'file', sectionName, folder);
            }
        };
        
        const folderSpan = document.createElement('span');
        folderSpan.textContent = `📁 ${folder}`; // Keep icon for clarity
        folderSpan.className = 'list-item-folder'; // Apply CSS class
        folderLi.appendChild(folderSpan);

        const files = data[folder] || [];
        if (files.length > 0) {
            const fileUl = document.createElement('ul');
            fileUl.style.listStyle = 'none';
            fileUl.style.padding = '0';
            fileUl.style.margin = '0';
            fileUl.style.paddingLeft = '20px'; // Basic indentation
            files.forEach(file => {
                const li = document.createElement('li');
                let displayFile = file;
                if (file.includes('_Part')) {
                    displayFile = `└─ ${file.substring(file.indexOf('Part'))}`;
                } else {
                    displayFile = `└─ ${file}`;
                }
                li.textContent = displayFile;
                li.className = 'list-item'; // Apply CSS class
                li.dataset.type = 'file'; // Set dataset type
                li.dataset.sectionName = sectionName; // Set dataset sectionName
                li.dataset.data = JSON.stringify(file); // Store actual data
                li.onclick = (event) => { event.stopPropagation(); handleItemClick(li, 'file', sectionName, file); }; 
                fileUl.appendChild(li);
            });
            folderLi.appendChild(fileUl);
        } else {
             const noFileLi = document.createElement('li');
             noFileLi.textContent = '└─ No files';
             noFileLi.style.paddingLeft = '20px'; // Basic indentation
             noFileLi.className = 'list-item-empty'; // Apply CSS class
             noFileLi.dataset.type = 'no-files'; // Set dataset type for clarity
             folderLi.appendChild(noFileLi);
        }
        ul.appendChild(folderLi);
    });
    listFieldElement.appendChild(ul);
}
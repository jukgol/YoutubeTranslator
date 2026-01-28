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
        li.style.whiteSpace = 'pre-wrap';
        li.style.color = '#333';
        li.style.fontSize = '0.8em';
        li.style.cursor = 'pointer';
        li.style.marginBottom = '4px'; // Increased spacing
        li.dataset.type = 'file'; // Set dataset type
        li.dataset.sectionName = sectionName; // Set dataset sectionName
        li.dataset.data = JSON.stringify(file); // Store actual data
        li.onclick = () => handleItemClick(li, 'file', sectionName, file);
        ul.appendChild(li);
    });
    listFieldElement.appendChild(ul);
}

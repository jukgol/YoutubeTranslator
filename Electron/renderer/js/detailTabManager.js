// Electron/renderer/js/detailTabManager.js

const pathMapping = {
    '원본': { api: 'pathGetSubtitleFiles', extensions: ['.srt', '.vtt'], type: 'flat' },
    '스플릿': { api: 'pathGetSplitFiles', type: 'nested' },
    '번역': { api: 'pathGetTranslatedFiles', type: 'nested' },
    '합치기': { api: 'pathGetCombineFiles', type: 'flat' }, // Changed to flat
    '결과': { api: 'pathGetResultFiles', type: 'flat' },    // Changed to flat
};

export async function initializeDetailTab() {
    console.log('Initializing Detail Tab...');
    const sections = document.querySelectorAll('.section-frame');

    for (const section of sections) {
        const header = section.querySelector('.section-header');
        const listField = section.querySelector('.list-field');
        const sectionName = header.textContent.replace(/^\d+\.\s*/, '').trim(); // "1. 원본" -> "원본"

        if (pathMapping[sectionName]) {
            const { api, type } = pathMapping[sectionName];
            try {
                let data;
                if (type === 'flat') {
                    data = await window.electronAPI[api]();
                    renderFlatList(listField, data);
                } else if (type === 'nested') {
                    data = await window.electronAPI[api]();
                    renderNestedList(listField, data);
                }
            } catch (error) {
                console.error(`Error fetching data for ${sectionName}:`, error);
                listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading data: ${error.message}</div>`;
            }
        }
    }
}

function renderFlatList(listFieldElement, files) {
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
        li.style.color = '#333'; // Add basic color
        li.style.fontSize = '0.95em'; // Add basic font size
        ul.appendChild(li);
    });
    listFieldElement.appendChild(ul);
}

function renderNestedList(listFieldElement, data) {
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
        folderLi.style.marginBottom = '5px';
        
        const folderSpan = document.createElement('span');
        folderSpan.textContent = `📁 ${folder}`; // Keep icon for clarity
        folderSpan.style.fontWeight = 'bold';
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
                li.style.whiteSpace = 'pre-wrap'; // Ensure pre-formatted text
                li.style.fontSize = '0.9em'; // Slightly smaller font
                li.style.color = '#555'; // Medium gray
                fileUl.appendChild(li);
            });
            folderLi.appendChild(fileUl);
        } else {
             const noFileLi = document.createElement('li');
             noFileLi.textContent = '└─ No files';
             noFileLi.style.paddingLeft = '20px'; // Basic indentation
             noFileLi.style.fontStyle = 'italic';
             noFileLi.style.color = '#aaa';
             folderLi.appendChild(noFileLi);
        }
        ul.appendChild(folderLi);
    });
    listFieldElement.appendChild(ul);
}
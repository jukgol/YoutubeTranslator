import { write as log } from '../logger.js'; // Corrected import path

export let currentSelectedElements = new Map(); // Map<sectionName, HTMLElement> to track selected elements per section

export function applyHighlight(element, isFolder) {
    if (element) {
        element.classList.add('selected');

        if (isFolder) {
            const fileUl = element.querySelector('ul');
            if (fileUl) {
                Array.from(fileUl.children).forEach(childLi => {
                    if (childLi.dataset.type === 'file') {
                        childLi.classList.add('selected');
                    }
                });
            }
        }
    }
}

export function removeHighlight(element, isFolder) {
    if (element) {
        element.classList.remove('selected');

        if (isFolder) {
            const fileUl = element.querySelector('ul');
            if (fileUl) {
                Array.from(fileUl.children).forEach(childLi => {
                    if (childLi.dataset.type === 'file') {
                        childLi.classList.remove('selected');
                    }
                });
            }
        }
    }
}

export function createItemClickHandler(pathMappingRef) {
    return function handleItemClick(clickedElement, type, sectionName, data) {
        let elementToHighlight = clickedElement;
        let dataToStore = data; // Default: store the data passed to the handler

        // Determine the actual element to highlight based on list type and clicked element type
        const listType = pathMappingRef[sectionName].type;

        if (listType === 'flat') {
            // For flat lists, always highlight the clicked file itself
            elementToHighlight = clickedElement;
        } else if (listType === 'nested') {
            // For nested lists:
            if (type === 'file' && clickedElement.closest('li[data-type="folder"]')) {
                // If a file inside a folder is clicked, highlight the parent folder LI
                elementToHighlight = clickedElement.closest('li[data-type="folder"]');
                // IMPORTANT: If we're highlighting the folder, we should store the folder's data
                // The folder's data is stored in its data-data attribute.
                if (elementToHighlight && elementToHighlight.dataset.data) {
                    dataToStore = JSON.parse(elementToHighlight.dataset.data); // Get folder's actual data
                }
            } else if (type === 'folder') {
                // If the folder header (folderLi) is clicked, highlight the folder LI
                elementToHighlight = clickedElement;
            }
        }

        // Get the previously selected element for THIS section
        const previousSelectedElementInSection = currentSelectedElements.get(sectionName);

        // Remove highlight from previously selected element in THIS section if it's different
        if (previousSelectedElementInSection && previousSelectedElementInSection !== elementToHighlight) {
            const wasFolder = previousSelectedElementInSection.dataset.type === 'folder';
            removeHighlight(previousSelectedElementInSection, wasFolder);
        }
        
        // Apply highlight to the new element
        const isFolder = (elementToHighlight.dataset.type === 'folder');
        applyHighlight(elementToHighlight, isFolder);
        
        // Update the map for THIS section
        currentSelectedElements.set(sectionName, elementToHighlight);

        // Store context in dataset for future reference (e.g., when removing highlight)
        elementToHighlight.dataset.sectionName = sectionName;
        elementToHighlight.dataset.type = elementToHighlight.dataset.type;
        elementToHighlight.dataset.data = JSON.stringify(dataToStore);

        log(`선택됨 (${sectionName}): 유형=${type}, 데이터=${JSON.stringify(dataToStore)}`);
        // log(`현재 강조된 요소 (${sectionName}):`, elementToHighlight); // This might be too verbose for UI log, keep it concise
    };
}

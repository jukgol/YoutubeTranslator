// Electron/renderer/js/detail/selectionHandler.js

export let currentSelectedElement = null; // Global variable to track the currently selected element

export function applyHighlight(element, isFolder) {
    if (element) {
        // Light blue highlight for the element itself
        element.style.backgroundColor = '#E0F2F7'; // A light, stylish blue
        element.style.color = '#000'; // Darker text for contrast
        element.style.borderRadius = '3px';
        element.style.paddingLeft = '5px'; // Small padding for visual comfort

        if (isFolder) {
            // Highlight children elements (files)
            const fileUl = element.querySelector('ul');
            if (fileUl) {
                Array.from(fileUl.children).forEach(childLi => {
                    // Only apply if it's a file item (not 'No files' message)
                    if (childLi.dataset.type === 'file') { // Check if it's a file item
                        childLi.style.backgroundColor = '#CFE9F2'; // A bit darker blue for nested files
                        childLi.style.color = '#333';
                        childLi.style.borderRadius = '3px';
                    }
                });
            }
        }
    }
}

export function removeHighlight(element, isFolder) {
    if (element) {
        // Reset styles for the element itself
        element.style.backgroundColor = '';
        element.style.color = '';
        element.style.borderRadius = '';
        element.style.paddingLeft = '';

        if (isFolder) {
            // Reset styles for children elements (files)
            const fileUl = element.querySelector('ul');
            if (fileUl) {
                Array.from(fileUl.children).forEach(childLi => {
                    // Only apply if it's a file item (not 'No files' message)
                    if (childLi.dataset.type === 'file') { // Check if it's a file item
                        childLi.style.backgroundColor = '';
                        childLi.style.color = '#555'; // Default color for nested files
                        childLi.style.borderRadius = '';
                    }
                });
            }
        }
    }
}

// NOTE: This handleItemClick needs pathMapping.type from index.js, so it will be implemented in index.js
// For now, let's just make it a placeholder.
// The actual handleItemClick will be in index.js and will be passed to renderers.
export function createItemClickHandler(pathMappingRef) {
    return function handleItemClick(clickedElement, type, sectionName, data) {
        let elementToHighlight = clickedElement;

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
            } else if (type === 'folder') {
                // If the folder header (folderLi) is clicked, highlight the folder LI
                elementToHighlight = clickedElement;
            }
        }

        // Remove highlight from previously selected element, using its stored type
        if (currentSelectedElement && currentSelectedElement !== elementToHighlight) {
            const wasFolder = currentSelectedElement.dataset.type === 'folder'; // Use dataset from the stored element
            removeHighlight(currentSelectedElement, wasFolder);
        }
        
        // Apply highlight to the new element
        const isFolder = (elementToHighlight.dataset.type === 'folder'); // Use dataset from the element to highlight
        applyHighlight(elementToHighlight, isFolder);
        currentSelectedElement = elementToHighlight;

        // Store context in dataset for future reference (e.g., when removing highlight)
        currentSelectedElement.dataset.sectionName = sectionName;
        currentSelectedElement.dataset.type = elementToHighlight.dataset.type; // Store the type of the element actually highlighted
        currentSelectedElement.dataset.data = JSON.stringify(data); // Store actual data for selection

        console.log(`Selected in ${sectionName}: Type=${type}, Data=`, data);
        console.log('Currently highlighted element:', currentSelectedElement);
    };
}

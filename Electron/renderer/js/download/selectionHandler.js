// Electron/renderer/js/download/selectionHandler.js

export let currentSelectedElement = null; // Global variable to track the currently selected element

export function applyHighlight(element) { // No isFolder needed for flat list
    if (element) {
        element.style.backgroundColor = '#E0F2F7'; // Light blue
        element.style.color = '#000'; // Dark text
        element.style.borderRadius = '3px';
        element.style.paddingLeft = '5px';
    }
}

export function removeHighlight(element) { // No isFolder needed for flat list
    if (element) {
        element.style.backgroundColor = '';
        element.style.color = '';
        element.style.borderRadius = '';
        element.style.paddingLeft = '';
    }
}

// createItemClickHandler is simplified as there's no nested logic in download tab
export function createItemClickHandler() {
    return function handleItemClick(clickedElement, type, sectionName, data) {
        // For flat lists, always highlight the clicked file itself
        let elementToHighlight = clickedElement;

        // Remove highlight from previously selected element
        if (currentSelectedElement && currentSelectedElement !== elementToHighlight) {
            removeHighlight(currentSelectedElement);
        }
        
        // Apply highlight to the new element
        applyHighlight(elementToHighlight);
        currentSelectedElement = elementToHighlight;

        // Store context in dataset for future reference (e.g., when removing highlight)
        currentSelectedElement.dataset.sectionName = sectionName;
        currentSelectedElement.dataset.type = type;
        currentSelectedElement.dataset.data = JSON.stringify(data);

        console.log(`Selected in ${sectionName}: Type=${type}, Data=`, data);
        console.log('Currently highlighted element:', currentSelectedElement);
    };
}

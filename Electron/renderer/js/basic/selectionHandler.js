// Electron/renderer/js/basic/selectionHandler.js

// This module-level variable will track the currently selected item across the tab.
let currentSelectedElement = null;

function applyHighlight(element) {
    if (element) {
        element.classList.add('selected');
    }
}

function removeHighlight(element) {
    if (element) {
        element.classList.remove('selected');
    }
}

// This factory creates a click handler for list items in the 'basic' tab.
export function createItemClickHandler() {
    return function handleItemClick(clickedElement) {
        // Remove highlight from the previously selected element
        if (currentSelectedElement && currentSelectedElement !== clickedElement) {
            removeHighlight(currentSelectedElement);
        }
        
        // Apply highlight to the newly clicked element
        applyHighlight(clickedElement);

        // Update the tracker
        currentSelectedElement = clickedElement;

        console.log(`Selected item:`, clickedElement.textContent);
    };
}
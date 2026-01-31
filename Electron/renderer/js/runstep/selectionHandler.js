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

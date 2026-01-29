// Electron/renderer/js/download/section/downloadComplecteSection.js

import { addFlatListItem } from '../listRenderers.js';
import { createItemClickHandler } from '../selectionHandler.js';
import { clearCompleted } from '../ipc_url.js';

export class CompleteSection {
    constructor(sectionElement) {
        this.sectionElement = sectionElement;
        this.listField = sectionElement.querySelector('#completeList');
        this.clearButton = sectionElement.querySelector('button');
        
        this.handleItemClick = createItemClickHandler();

        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.clearButton) {
            this.clearButton.addEventListener('click', async () => {
                console.log('Clear completed list button clicked.');
                const success = await clearCompleted();
                if (success) {
                    if(this.listField) this.listField.innerHTML = '';
                }
            });
        }
    }

    addItem(item) {
        if (this.listField) {
            // The item is already formatted correctly by addFlatListItem
            addFlatListItem(this.listField, item, '다운로드 완료', this.handleItemClick);
        }
    }
}

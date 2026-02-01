import { renderFlatList } from '../listRenderers.js';
import { createItemClickHandler } from '../../download/selectionHandler.js';

export class OriginSection {
    constructor(sectionElement) {
        this.sectionElement = sectionElement;
        this.listField = sectionElement.querySelector('#originList');

        this.handleItemClick = createItemClickHandler();

        this.refresh();
        this._setupButton();

        // Listen for new subtitle creation events
        document.addEventListener('subtitle-file-created', () => {
            console.log('[OriginSection] New subtitle file detected. Refreshing list...');
            this.refresh();
        });
    }

    _setupButton() {
        const btn = this.sectionElement.querySelector('#subtitle-open-origin-folder-button');
        if (btn) {
            btn.addEventListener('click', async () => {
                try {
                    const originDir = await window.electronAPI.paths.getAppOriginDirectory();
                    await window.electronAPI.paths.openPath(originDir);
                } catch (error) {
                    console.error('Failed to open origin folder:', error);
                }
            });
        }
    }

    async refresh() {
        if (this.listField) {
            try {
                // Reuse existing IPC channel for subtitle files (Origin directory)
                const data = await window.electronAPI.paths.getSubtitleFiles();
                renderFlatList(this.listField, data, '오리진', this.handleItemClick);
            } catch (error) {
                console.error(`Error fetching origin files:`, error);
                this.listField.innerHTML = `<div style="color: red; font-weight: bold; padding: 10px; text-align: center;">Error loading origin files: ${error.message}</div>`;
            }
        }
    }
}

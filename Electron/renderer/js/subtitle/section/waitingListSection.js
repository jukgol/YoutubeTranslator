import { renderFlatList } from '../listRenderers.js';
import { write as log } from '../../logger.js';
import { QueueProcessor } from '../queueProcessor.js';

export class WaitingListSection {
    #element;
    #listField;
    #queue = [];
    #sectionName = 'Subtitle_Queue'; // Unique name for selection logic

    // UI Elements
    #startBtn;
    #stopBtn;
    #clearBtn;

    // Logic
    #queueProcessor;

    constructor(sectionElement) {
        this.#element = sectionElement;
        this.#listField = sectionElement.querySelector('#waitingList');

        this.#startBtn = sectionElement.querySelector('#subtitle-start-btn');
        this.#stopBtn = sectionElement.querySelector('#subtitle-stop-btn');
        this.#clearBtn = sectionElement.querySelector('#subtitle-clear-btn');

        this.#queueProcessor = new QueueProcessor(this);

        this.#bindEvents();
        // Initial render
        this.renderList();
    }

    get selectedLanguage() {
        const select = this.#element.querySelector('#subtitle-language-select');
        return select ? select.value : null;
    }

    #bindEvents() {
        if (this.#startBtn) {
            this.#startBtn.addEventListener('click', () => {
                this.#queueProcessor.start();
            });
        }
        if (this.#stopBtn) {
            this.#stopBtn.addEventListener('click', () => {
                this.#queueProcessor.stop();
            });
        }
        if (this.#clearBtn) {
            this.#clearBtn.addEventListener('click', () => {
                if (confirm('대기 목록을 모두 지우시겠습니까?')) {
                    this.#queue = [];
                    this.renderList();
                }
            });
        }
    }

    add(item) {
        if (!item || !item.name) {
            log('[WaitingList] Add failed: Invalid item');
            return;
        }

        // Check for duplicates
        if (this.#queue.some(existingItem => existingItem.name === item.name)) {
            log(`[WaitingList] Duplicate ignored: ${item.name}`);
            return;
        }

        this.#queue.push({
            name: item.name,
            status: 'pending'
        });

        log(`[WaitingList] Item added to queue: ${item.name}`);
        this.renderList();
    }

    renderList() {
        if (!this.#listField) return;

        // Delegate empty state handling to renderFlatList
        const data = this.#queue.map(item => item.name);
        renderFlatList(this.#listField, data, this.#sectionName);

        // Apply status styles
        const listItems = this.#listField.querySelectorAll('li[data-type="file"]');
        listItems.forEach((li, index) => {
            const item = this.#queue[index];
            if (item) {
                // Remove all status classes first
                li.classList.remove('status-pending', 'status-processing', 'status-completed', 'status-failed');
                // Add current status class
                li.classList.add(`status-${item.status}`);
            }
        });
    }

    // Methods for QueueProcessor
    getNextPendingItem() {
        return this.#queue.find(item => item.status === 'pending');
    }

    updateItemStatus(name, status) {
        const item = this.#queue.find(i => i.name === name);
        if (item) {
            item.status = status;
            this.renderList();
        }
    }

    setProcessingState(isProcessing) {
        if (this.#startBtn) this.#startBtn.disabled = isProcessing;
        if (this.#stopBtn) this.#stopBtn.disabled = !isProcessing;
        if (this.#clearBtn) this.#clearBtn.disabled = isProcessing;
    }

    refresh() {
        // No external data to fetch, just re-render current state if needed
        this.renderList();
    }
}

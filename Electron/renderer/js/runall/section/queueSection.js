// Electron/renderer/js/runall/section/queueSection.js
import { write as log } from '../../logger.js';
import { renderFlatList } from '../listRenderers.js';

export class QueueSection {
    #element;
    #listField;
    #startBtn;
    #stopBtn;
    #clearBtn;
    #queue = [];
    #sectionName = 'RunAll_Queue';

    constructor(element) {
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#startBtn = this.#element.querySelector('#queue-start-btn');
        this.#stopBtn = this.#element.querySelector('#queue-stop-btn');
        this.#clearBtn = this.#element.querySelector('#clear-queue-btn');
        
        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        this.#startBtn.addEventListener('click', () => {
            console.log('Queue Start button clicked');
            // Logic to be implemented
        });

        // The stop logic for the full routine is now handled by ProgressSection.
        // This stop button would control the current QueueSection's own processing if any,
        // but for now, we remove the #stopRequested logic.
        this.#stopBtn.addEventListener('click', () => {
            log('큐의 현재 작업을 중단합니다. (기능 미구현)');
            // Placeholder for future individual stop logic if needed
        });

        this.#clearBtn.addEventListener('click', () => {
            log('작업 큐를 비웁니다.');
            this.#queue = [];
            this.#renderList();
        });
    }

    #setButtonsDisabled(disabled) {
        this.#startBtn.disabled = disabled;
        this.#stopBtn.disabled = disabled;
        this.#clearBtn.disabled = disabled;
    }

    add(item) {
        if (!item || !item.name) {
            log('추가할 항목이 유효하지 않습니다.');
            return;
        }

        if (this.#queue.some(existingItem => existingItem.name === item.name)) {
            log(`항목이 이미 큐에 존재합니다: ${item.name}`);
            return;
        }
        
        log(`큐에 추가됨: ${item.name}`);
        this.#queue.push(item);
        this.#renderList();
    }

    #renderList() {
        const data = this.#queue.map(item => item.name);
        renderFlatList(this.#listField, data, this.#sectionName);
        
        // Restore background colors on re-render
        const listItems = this.#listField.querySelectorAll('li[data-type="file"]');
        listItems.forEach((li, index) => {
            if (this.#queue[index].status === 'completed') {
                li.style.backgroundColor = '#A7F3D0';
            }
        });
    }

    async refresh() {
        log('QueueSection refreshed.');
        this.#renderList();
    }

    getQueueItems() {
        return this.#queue;
    }
}

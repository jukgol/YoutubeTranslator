// Electron/renderer/js/runall/section/queueSection.js
import { write as log } from '../../logger.js';

export class QueueSection {
    #element;
    #listField;
    #startBtn;
    #stopBtn;
    #clearBtn;

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

        this.#stopBtn.addEventListener('click', () => {
            console.log('Queue Stop button clicked');
            // Logic to be implemented
        });

        this.#clearBtn.addEventListener('click', () => {
            console.log('Clear Queue button clicked');
            // Logic to be implemented
        });
    }

    async refresh() {
        // Placeholder for loading queue list
        log('QueueSection refreshed.');
        this.#listField.innerHTML = '<p style="color: #888; padding: 10px;">(작업 큐 목록이 여기에 표시됩니다)</p>';
    }
}

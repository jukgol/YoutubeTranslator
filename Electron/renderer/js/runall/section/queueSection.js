// Electron/renderer/js/runall/section/queueSection.js
import { write as log } from '../../logger.js';
import { renderFlatList } from '../listRenderers.js';

export class QueueSection {
    #element;
    #listField;
    #startBtn;
    #stopBtn;
    #clearBtn;
    // #testBtn; // Removed
    #queue = [];
    #sectionName = 'RunAll_Queue';

    constructor(element) {
        this.#element = element;
        this.#listField = this.#element.querySelector('.list-field');
        this.#startBtn = this.#element.querySelector('#queue-start-btn');
        this.#stopBtn = this.#element.querySelector('#queue-stop-btn');
        this.#clearBtn = this.#element.querySelector('#clear-queue-btn');
        // this.#testBtn = this.#element.querySelector('#queue-test-btn'); // Removed
        
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
            log('작업 큐를 비웁니다.');
            this.#queue = [];
            this.#renderList();
        });

        // this.#testBtn.addEventListener('click', () => this.#runTest()); // Removed
    }

    // #setButtonsDisabled(disabled) { // Removed
    //     this.#startBtn.disabled = disabled;
    //     this.#stopBtn.disabled = disabled;
    //     this.#clearBtn.disabled = disabled;
    //     this.#testBtn.disabled = disabled;
    // }

    // async #runTest() { // Removed
    //     log('큐 테스트를 시작합니다...');
    //     this.#setButtonsDisabled(true);

    //     const listItems = this.#listField.querySelectorAll('li[data-type="file"]');
    //     if (listItems.length !== this.#queue.length) {
    //         console.error('큐와 UI 목록의 아이템 개수가 일치하지 않습니다.');
    //         this.#setButtonsDisabled(false);
    //         return;
    //     }

    //     for (let i = 0; i < this.#queue.length; i++) {
    //         const item = this.#queue[i];
    //         const listItem = listItems[i];
            
    //         log(`[테스트] 처리 중: ${item.name}`);
            
    //         // Wait for 2 seconds
    //         await new Promise(resolve => setTimeout(resolve, 2000));
            
    //         item.status = 'completed';
    //         listItem.style.backgroundColor = '#A7F3D0'; // Light green
    //         log(`[테스트] 완료: ${item.name}`);
    //     }
        
    //     log('큐 테스트가 완료되었습니다.');
    //     this.#setButtonsDisabled(false);
    // }

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
}

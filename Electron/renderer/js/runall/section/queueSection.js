// Electron/renderer/js/runall/section/queueSection.js
import { write as log } from '../../logger.js';
import { renderFlatList } from '../listRenderers.js';

export class QueueSection {
    #element;
    #listField;
    #startBtn;
    #stopBtn;
    #clearBtn;
    #testBtn;
    #queue = [];
    #sectionName = 'RunAll_Queue';
    #isTestRunning = false;
    #testPauseIndex = 0;

    constructor(element) {
        this.#element = element;
        this.#listField = this.#element.querySelector('.list-field');
        this.#startBtn = this.#element.querySelector('#queue-start-btn');
        this.#stopBtn = this.#element.querySelector('#queue-stop-btn');
        this.#clearBtn = this.#element.querySelector('#clear-queue-btn');
        this.#testBtn = this.#element.querySelector('#queue-test-btn');
        
        this.#bindEvents();
        this.refresh();
    }

    #bindEvents() {
        this.#startBtn.addEventListener('click', () => {
            console.log('Queue Start button clicked');
            // Logic to be implemented
        });

        this.#stopBtn.addEventListener('click', () => {
            log('큐 테스트 중단 요청됨.');
            this.#isTestRunning = false;
            this.#setButtonsDisabled(false);
        });

        this.#clearBtn.addEventListener('click', () => {
            log('작업 큐를 비웁니다.');
            this.#queue = [];
            this.#renderList();
        });

        // this.#testBtn.addEventListener('click', () => this.#runTest()); // Removed
        this.#testBtn.addEventListener('click', () => this.#runTest());
    }

    #setButtonsDisabled(disabled) {
        // 'disabled' is true when test starts/runs, false when test stops/finishes
        this.#startBtn.disabled = disabled; // Disable "번역 시작"
        this.#clearBtn.disabled = disabled; // Disable "큐 초기화"
        this.#testBtn.disabled = disabled;   // Disable "테스트"
        this.#stopBtn.disabled = !disabled; // Enable "멈춤" when test is running, disable when test is stopped
    }

    async #runTest() {
        if (this.#isTestRunning) {
            log('테스트가 이미 실행 중입니다.');
            return;
        }

        log(`큐 테스트를 시작합니다... (재개 지점: ${this.#testPauseIndex})`);
        this.#isTestRunning = true;
        this.#setButtonsDisabled(true);

        const listItems = this.#listField.querySelectorAll('li[data-type="file"]');
        if (listItems.length !== this.#queue.length) {
            console.error('큐와 UI 목록의 아이템 개수가 일치하지 않습니다.');
            this.#isTestRunning = false;
            this.#testPauseIndex = 0;
            this.#setButtonsDisabled(false);
            return;
        }

        for (let i = this.#testPauseIndex; i < this.#queue.length; i++) {
            if (!this.#isTestRunning) {
                break; // Exit loop if test is stopped
            }

            const item = this.#queue[i];
            const listItem = listItems[i];
            
            log(`[테스트] 처리 중: ${item.name}`);
            
            // Wait for 2 seconds
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (!this.#isTestRunning) { // Check again after await
                break; // Exit loop if test is stopped during await
            }

            item.status = 'completed';
            listItem.style.backgroundColor = '#A7F3D0'; // Light green
            log(`[테스트] 완료: ${item.name}`);
            this.#testPauseIndex = i + 1; // Update pause index
        }
        
        if (!this.#isTestRunning) {
            log('큐 테스트가 중단되었습니다.');
        } else {
            log('큐 테스트가 완료되었습니다.');
            this.#testPauseIndex = 0; // Reset only if completed fully
        }

        this.#isTestRunning = false;
        this.#setButtonsDisabled(false);
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
}

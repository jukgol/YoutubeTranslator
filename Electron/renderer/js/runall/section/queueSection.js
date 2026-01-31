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

    // Test routine state
    #isTestRunning = false;
    #testStopRequested = false;
    #currentTestIndex = -1; // -1: Not started, 0-n: current item index

    // Production routine state
    #progressSection; // Reference to the ProgressSection instance
    #isProcessingRunning = false;
    #processingStopRequested = false;
    #currentProcessingIndex = -1; // -1: Not started, 0-n: current item index

    #isTestMode = false; // Flag to switch between test and production

    constructor(element) { // No longer accepts progressSection instance directly
        this.#element = element;
        
        this.#listField = this.#element.querySelector('.list-field');
        this.#startBtn = this.#element.querySelector('#queue-start-btn');
        this.#stopBtn = this.#element.querySelector('#queue-stop-btn');
        this.#clearBtn = this.#element.querySelector('#clear-queue-btn');
        
        this.#bindEvents();
        this.refresh();
        this.#updateButtonStates(); // Initial button states based on mode
    }

    setProgressSection(progressSection) {
        this.#progressSection = progressSection;
    }

    setTestMode(enabled) {
        this.#isTestMode = enabled;
        log(`큐 섹션: 테스트 모드 ${enabled ? '활성화' : '비활성화'}`);
        this.#updateButtonStates();
    }

    #bindEvents() {
        this.#startBtn.addEventListener('click', async () => {
            if (this.#isTestMode) {
                if (this.#isTestRunning) return;
                await this.#handleStartTestRoutine();
            } else {
                if (this.#isProcessingRunning) return;
                await this.#handleStartProcessingRoutine();
            }
        });

        this.#stopBtn.addEventListener('click', () => {
            if (this.#isTestMode) {
                if (this.#isTestRunning) {
                    log('테스트 루틴 중단 요청됨.');
                    this.#testStopRequested = true;
                    this.#updateButtonStates();
                }
            } else {
                if (this.#isProcessingRunning) {
                    log('큐 처리 루틴 중단 요청됨.');
                    this.#processingStopRequested = true;
                    this.#updateButtonStates();
                }
            }
        });

        this.#clearBtn.addEventListener('click', () => {
            log('작업 큐를 비웁니다.');
            this.#queue = [];
            this.#currentTestIndex = -1; // Reset test index
            this.#currentProcessingIndex = -1; // Reset processing index
            this.#renderList();
            this.#updateButtonStates();
        });
    }

    async #handleStartTestRoutine() {
        if (this.#currentTestIndex === -1 || this.#currentTestIndex >= this.#queue.length) {
            log('새 테스트 루틴 시작.');
            this.#currentTestIndex = 0; // Start from beginning
        } else {
            log('테스트 루틴 재개.');
        }

        await this.#runTestRoutine();
    }

    async #handleStartProcessingRoutine() {
        // Find the first item that is not completed
        let startIndex = this.#queue.findIndex(item => item.status !== 'completed');

        if (startIndex === -1 || startIndex >= this.#queue.length) { // All items are processed or queue is empty
            log('큐에 처리할 항목이 없습니다.');
            this.#currentProcessingIndex = -1; // Reset
            this.#updateButtonStates();
            return;
        }

        if (this.#currentProcessingIndex === -1 || this.#currentProcessingIndex >= this.#queue.length || this.#currentProcessingIndex < startIndex) {
            log('새 큐 처리 루틴 시작.');
            this.#currentProcessingIndex = startIndex; // Start from the first pending item
        } else {
            log('큐 처리 루틴 재개.');
        }

        await this.#runQueueProcessingRoutine();
    }

    #updateButtonStates() {
        if (this.#isTestMode) {
            // Test mode button states
            if (this.#isTestRunning) {
                this.#startBtn.disabled = true;
                this.#startBtn.textContent = '진행 중...';
                this.#stopBtn.disabled = false;
                this.#stopBtn.textContent = '멈춤';
                this.#clearBtn.disabled = true;
            } else {
                this.#startBtn.disabled = false;
                this.#clearBtn.disabled = false;
                
                if (this.#currentTestIndex > -1 && this.#currentTestIndex < this.#queue.length) { // Paused
                    this.#startBtn.textContent = '재개';
                    this.#stopBtn.disabled = false;
                } else { // Not started or finished
                    this.#startBtn.textContent = '테스트 시작';
                    this.#stopBtn.disabled = true;
                }
                this.#stopBtn.textContent = '멈춤'; // Reset stop text
            }
        } else {
            // Production mode button states
            if (this.#isProcessingRunning) {
                this.#startBtn.disabled = true;
                this.#startBtn.textContent = '진행 중...';
                this.#stopBtn.disabled = false;
                this.#stopBtn.textContent = '멈춤';
                this.#clearBtn.disabled = true;
            } else {
                this.#startBtn.disabled = false;
                this.#clearBtn.disabled = false;
                
                if (this.#currentProcessingIndex > -1 && this.#currentProcessingIndex < this.#queue.length) { // Paused
                    this.#startBtn.textContent = '재개';
                    this.#stopBtn.disabled = false;
                } else { // Not started or finished
                    this.#startBtn.textContent = '시작'; // Default text for production start
                    this.#stopBtn.disabled = true;
                }
                this.#stopBtn.textContent = '멈춤'; // Reset stop text
            }
        }
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
        this.#queue.push({ ...item, status: 'pending' }); // Ensure status is added
        this.#renderList();
        this.#updateButtonStates(); // Update button state
    }

    #renderList() {
        const data = this.#queue.map(item => item.name);
        renderFlatList(this.#listField, data, this.#sectionName);
        
        // Apply status-based styling
        const listItems = this.#listField.querySelectorAll('li[data-type="file"]');
        listItems.forEach((li, index) => {
            const itemStatus = this.#queue[index]?.status;
            li.classList.remove('status-pending', 'status-processing', 'status-completed', 'status-failed'); // Clean existing
            switch (itemStatus) {
                case 'processing':
                    li.classList.add('status-processing');
                    break;
                case 'completed':
                    li.classList.add('status-completed');
                    break;
                case 'failed':
                    li.classList.add('status-failed');
                    break;
                case 'pending':
                default:
                    li.classList.add('status-pending');
                    break;
            }
        });
    }

    async #runTestRoutine() {
        this.#isTestRunning = true;
        this.#testStopRequested = false;
        this.#updateButtonStates();

        for (let i = this.#currentTestIndex; i < this.#queue.length; i++) {
            if (this.#testStopRequested) {
                log('테스트 루틴이 중단 요청되었습니다.');
                this.#isTestRunning = false;
                this.#updateButtonStates();
                return;
            }

            const item = this.#queue[i];
            this.#currentTestIndex = i; // Update current index

            item.status = 'processing';
            this.#renderList();
            log(`[테스트] ${item.name} 처리 중...`);

            await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

            // Simulate success/failure for demonstration (e.g., random)
            const success = Math.random() > 0.3; // 70% success rate
            if (success) {
                item.status = 'completed';
                log(`[테스트] ${item.name} 완료.`);
            } else {
                item.status = 'failed';
                log(`[테스트] ${item.name} 실패.`);
            }
            this.#renderList();
        }

        this.#isTestRunning = false;
        this.#currentTestIndex = -1; // Reset after completion
        log('테스트 루틴 완료.');
        this.#updateButtonStates();
    }

    async #runQueueProcessingRoutine() {
        this.#isProcessingRunning = true;
        this.#processingStopRequested = false;
        this.#updateButtonStates();

        for (let i = this.#currentProcessingIndex; i < this.#queue.length; i++) {
            if (this.#processingStopRequested) {
                log('큐 처리 루틴이 중단 요청되었습니다.');
                this.#isProcessingRunning = false;
                this.#updateButtonStates();
                return;
            }

            const item = this.#queue[i];
            this.#currentProcessingIndex = i; // Update current index

            item.status = 'processing';
            this.#renderList();
            log(`[처리] ${item.name} 처리 중...`);

            const success = await this.#progressSection.runStepByStepRoutine(item.name);

            if (success) {
                item.status = 'completed';
                log(`[처리] ${item.name} 완료.`);
            } else {
                item.status = 'failed';
                log(`[처리] ${item.name} 실패.`);
            }
            this.#renderList();
        }

        this.#isProcessingRunning = false;
        this.#currentProcessingIndex = -1; // Reset after completion
        log('큐 처리 루틴 완료.');
        this.#updateButtonStates();
    }


    async refresh() {
        log('QueueSection refreshed.');
        this.#renderList();
        this.#updateButtonStates(); // Ensure buttons are updated on refresh
    }

    getQueueItems() {
        return this.#queue;
    }
}

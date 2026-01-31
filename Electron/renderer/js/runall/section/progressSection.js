// Electron/renderer/js/runall/section/progressSection.js
import { write as log } from '../../logger.js';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export class ProgressSection {
    #element;
    #statusLabels;
    #stopBtn;
    #startTestBtn;
    #isTestRunning = false;

    constructor(element) {
        this.#element = element;
        this.#statusLabels = this.#element.querySelectorAll('.status-label');
        this.#stopBtn = this.#element.querySelector('#status-stop-btn');
        this.#startTestBtn = this.#element.querySelector('#start-test-btn');
        
        this.#bindEvents();
    }

    #resetStopButton() {
        this.#stopBtn.textContent = '멈춤';
        this.#stopBtn.style.backgroundColor = '#F87171'; // Original red color
    }

    #bindEvents() {
        this.#stopBtn.addEventListener('click', () => {
            if (this.#stopBtn.textContent === '멈춤') {
                if (this.#isTestRunning) {
                    log('테스트 시퀀스를 중지합니다.');
                    this.#isTestRunning = false; // Signal the loop to stop
                    this.#stopBtn.textContent = '다시 시작';
                    this.#stopBtn.style.backgroundColor = '#34D399'; // A green color for restart
                }
            } else { // Text is '다시 시작'
                log('테스트 시퀀스를 다시 시작합니다.');
                this.runTestSequence();
            }
        });

        this.#startTestBtn.addEventListener('click', async () => {
            if (this.#isTestRunning) return;
            this.#resetStopButton();
            await this.runTestSequence();
        });
    }

    /**
     * Updates the status display to highlight the specified step.
     * @param {number} stepIndex The index of the step to activate (0-4). -1 to deactivate all.
     */
    updateStatus(stepIndex) {
        this.#statusLabels.forEach((label, index) => {
            label.classList.toggle('active', index === stepIndex);
        });
        if (stepIndex > -1 && stepIndex < this.#statusLabels.length) {
            log(`진행 상태: ${this.#statusLabels[stepIndex].textContent.trim()}`);
        }
    }

    /**
     * Runs a test sequence to demonstrate the status updates.
     */
    async runTestSequence() {
        if (this.#isTestRunning) return; // Prevent multiple concurrent runs

        this.#resetStopButton();
        log('프로그레스 바 테스트 시퀀스를 시작합니다.');
        this.#startTestBtn.disabled = true;
        this.#isTestRunning = true;

        try {
            for (let i = 0; i < this.#statusLabels.length; i++) {
                if (!this.#isTestRunning) {
                    log('테스트 시퀀스가 사용자에 의해 중지되었습니다.');
                    break;
                }
                this.updateStatus(i);
                await delay(5000);
            }
            if (this.#isTestRunning) { // Only log completion if it wasn't stopped
                log('테스트 시퀀스 완료.');
            }
        } catch (error) {
            log(`테스트 시퀀스 중 오류 발생: ${error}`);
        } finally {
            // If stopped by user, state remains as is. If completes, set to final state.
            if (this.#isTestRunning) {
                this.updateStatus(4);
            }
            this.#isTestRunning = false;
            this.#startTestBtn.disabled = false;
        }
    }
}

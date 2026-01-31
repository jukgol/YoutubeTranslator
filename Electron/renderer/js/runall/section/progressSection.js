// Electron/renderer/js/runall/section/progressSection.js
import { write as log } from '../../logger.js';

export class ProgressSection {
    #element;
    #statusLabels;
    #startTestButton; // Matches #start-test-btn in HTML
    #stopButton;    // Matches #status-stop-btn in HTML
    #originalDataSection; // Reference to the OriginalDataSection instance
    #isRoutineRunning = false;
    #stopRequested = false;
    #currentStepIndex = -1; // -1: Ready, 0-3: processing a step, 4: completed, 5: stopped/paused
    #currentFileName = ''; // Store the filename being processed

    constructor(element, originalDataSection) {
        this.#element = element;
        this.#originalDataSection = originalDataSection; // Store originalDataSection instance
        this.#statusLabels = this.#element.querySelectorAll('.status-label');
        this.#startTestButton = this.#element.querySelector('#start-test-btn');
        this.#stopButton = this.#element.querySelector('#status-stop-btn');
        
        this.#bindEvents();
        this.#setRoutineButtonsDisabled(false); // Initial state
    }

    #bindEvents() {
        this.#stopButton.addEventListener('click', () => {
            if (this.#isRoutineRunning) {
                log('단계별 루틴 중단 요청됨.');
                this.#stopRequested = true;
                this.#stopButton.disabled = true; // Disable stop button immediately after request
            }
        });

        this.#startTestButton.addEventListener('click', async () => {
            if (this.#isRoutineRunning) {
                // If already running, this button should be disabled, so this case shouldn't be reached.
                // But as a safeguard:
                return;
            }
            this.#handleStartOrResumeRoutine(); // New handler for starting/resuming
        });
    }

    // New method to handle starting or resuming the routine
    async #handleStartOrResumeRoutine() {
        if (this.#currentStepIndex === -1 || this.#currentStepIndex === 4) { // Not started yet, or previously completed
            log('새 루틴 시작 버튼 클릭됨. 원본 데이터 선택 확인 중...');
            const selectedLi = this.#originalDataSection.getSelectedFileElement(); 
            
            if (!selectedLi) {
                log('루틴을 시작하려면 원본 데이터에서 파일을 먼저 선택하세요.');
                return;
            }
            this.#currentFileName = selectedLi.textContent.trim();
            this.#currentStepIndex = 0; // Start from the first step
        } else {
            log('루틴 재개 버튼 클릭됨.');
        }

        log(`선택된 파일: ${this.#currentFileName}`);
        await this.#runStepByStepRoutine(this.#currentFileName);
    }


    #setRoutineButtonsDisabled(disabled) {
        this.#startTestButton.disabled = disabled;
        this.#stopButton.disabled = disabled; // When routine is running, stop button is enabled. When stopped/not running, it's disabled.

        if (disabled) { // Routine is running or start is disabled
            this.#startTestButton.textContent = '진행 중...';
            this.#stopButton.textContent = '멈춤';
        } else { // Routine is not running
            if (this.#currentStepIndex > -1 && this.#currentStepIndex < 4) { // Paused
                this.#startTestButton.textContent = '재개';
                this.#stopButton.textContent = '멈춤'; // Still can request stop if already started
            } else { // Ready to start or completed
                this.#startTestButton.textContent = '테스트 시작';
                this.#stopButton.textContent = '멈춤';
            }
        }
    }


    /**
     * Updates the status display to highlight the specified step.
     * @param {number} stepIndex The index of the step to activate (0-4). -1 to deactivate all.
     */
    updateStatus(stepIndex, isSuccess = true) {
        this.#statusLabels.forEach((label, index) => {
            const isActive = index === stepIndex;
            label.classList.toggle('active', isActive);
            if (isActive) {
                label.classList.toggle('failed', !isSuccess);
            } else {
                label.classList.remove('failed'); // Clear failed status when not active
            }
        });
        if (stepIndex > -1 && stepIndex < this.#statusLabels.length) {
            const statusText = this.#statusLabels[stepIndex].textContent.trim();
            log(`진행 상태: ${statusText} ${isSuccess ? '성공' : '실패'}`);
        }
    }

    async #runStepByStepRoutine(filename) {
        // Only set this to true if starting fresh, not resuming
        if (this.#currentStepIndex === 0) { // Starting fresh
            this.#isRoutineRunning = true;
            this.#stopRequested = false; // Reset stop flag
            this.#setRoutineButtonsDisabled(true); // Disable start, enable stop
            this.updateStatus(-1); // Clear all status labels
        } else if (this.#currentStepIndex > 0 && this.#currentStepIndex < 4) { // Resuming
            this.#isRoutineRunning = true;
            this.#stopRequested = false;
            this.#setRoutineButtonsDisabled(true);
            log('루틴이 재개되었습니다.');
        } else { // Should not happen with current logic, but as a safeguard
            log('루틴이 이미 실행 중이거나 잘못된 상태입니다.');
            return;
        }

        let overallSuccess = true;
        let currentCreatedFolder = '';
        let currentTranslatedFolder = '';
        let currentCombinedFile = '';
        
        // This structure allows resuming from a specific step
        // 1. Split Step (index 0)
        if (overallSuccess && this.#currentStepIndex === 0 && !this.#stopRequested) {
            this.updateStatus(0);
            log(`[STEP 1/4] 분할 시작: ${filename}`);
            try {
                const currentStepResult = await window.electronAPI.process.runSplit(filename);
                if (this.#stopRequested) {
                    log('단계별 루틴 중단 요청으로 현재 단계 완료 후 종료합니다.');
                }
                if (currentStepResult.success) {
                    log(`분할 완료: ${currentStepResult.createdFolder}`);
                    currentCreatedFolder = window.electronAPI.path.basename(currentStepResult.createdFolder);
                    this.updateStatus(0, true);
                    this.#currentStepIndex = 1; // Move to next step
                } else {
                    overallSuccess = false;
                    log(`[루틴] 분할 단계 실패: ${currentStepResult.message}`);
                    this.updateStatus(0, false);
                }
            } catch (error) {
                overallSuccess = false;
                log(`[Error] 분할 작업 중 예외 발생: ${error.message}`);
                this.updateStatus(0, false);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
        }

        // 2. Translate Step (index 1)
        if (overallSuccess && this.#currentStepIndex === 1 && !this.#stopRequested) {
            this.updateStatus(1);
            log(`[STEP 2/4] 번역 시작: ${currentCreatedFolder}`);
            try {
                const currentStepResult = await window.electronAPI.process.runTranslation(currentCreatedFolder);
                if (this.#stopRequested) {
                    log('단계별 루틴 중단 요청으로 현재 단계 완료 후 종료합니다.');
                }
                if (currentStepResult.success) {
                    log(`번역 완료: ${currentStepResult.translatedFolder}`);
                    currentTranslatedFolder = window.electronAPI.path.basename(currentStepResult.translatedFolder);
                    this.updateStatus(1, true);
                    this.#currentStepIndex = 2; // Move to next step
                } else {
                    overallSuccess = false;
                    log(`[루틴] 번역 단계 실패: ${currentStepResult.message}`);
                    this.updateStatus(1, false);
                }
            } catch (error) {
                overallSuccess = false;
                log(`[Error] 번역 작업 중 예외 발생: ${error.message}`);
                this.updateStatus(1, false);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
        }
            
        // 3. Combine Parts Step (index 2)
        if (overallSuccess && this.#currentStepIndex === 2 && !this.#stopRequested) {
            this.updateStatus(2);
            log(`[STEP 3/4] 파트 합치기 시작: ${currentTranslatedFolder}`);
            try {
                const currentStepResult = await window.electronAPI.process.runCombine(currentTranslatedFolder);
                if (this.#stopRequested) {
                    log('단계별 루틴 중단 요청으로 현재 단계 완료 후 종료합니다.');
                }
                if (currentStepResult.success) {
                    log(`파트 합치기 완료: ${currentStepResult.combinedFile}`);
                    currentCombinedFile = window.electronAPI.path.basename(currentStepResult.combinedFile);
                    this.updateStatus(2, true);
                    this.#currentStepIndex = 3; // Move to next step
                } else {
                    overallSuccess = false;
                    log(`[루틴] 파트 합치기 단계 실패: ${currentStepResult.message}`);
                    this.updateStatus(2, false);
                }
            } catch (error) {
                overallSuccess = false;
                log(`[Error] 파트 합치기 작업 중 예외 발생: ${error.message}`);
                this.updateStatus(2, false);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
        }

        // 4. Combine Timeline Step (index 3)
        if (overallSuccess && this.#currentStepIndex === 3 && !this.#stopRequested) {
            this.updateStatus(3);
            log(`[STEP 4/4] 타임라인 생성 시작: ${currentCombinedFile}`);
            try {
                const currentStepResult = await window.electronAPI.process.runTimeline(currentCombinedFile);
                if (this.#stopRequested) {
                    log('단계별 루틴 중단 요청으로 현재 단계 완료 후 종료합니다.');
                }
                if (currentStepResult.success) {
                    log(`타임라인 생성 완료: ${currentStepResult.finalSrtFile}`);
                    this.updateStatus(3, true);
                    this.#currentStepIndex = 4; // Routine completed
                } else {
                    overallSuccess = false;
                    log(`[루틴] 타임라인 생성 단계 실패: ${currentStepResult.message}`);
                    this.updateStatus(3, false);
                }
            } catch (error) {
                overallSuccess = false;
                log(`[Error] 타임라인 생성 작업 중 예외 발생: ${error.message}`);
                this.updateStatus(3, false);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay for 1 second
        }
            
        // Finalization
        this.#isRoutineRunning = false;
        this.#setRoutineButtonsDisabled(false); // Re-enable buttons based on current state

        if (this.#stopRequested) {
            log('단계별 루틴이 사용자 요청에 의해 중단되었습니다.');
            this.#currentStepIndex = 5; // Mark as explicitly stopped
            overallSuccess = false; // A stop request makes the overall process not a success
        } else if (overallSuccess && this.#currentStepIndex === 4) {
            log('✅ 단계별 루틴이 성공적으로 완료되었습니다.');
            this.#currentStepIndex = -1; // Ready for new routine
        } else {
            log(`❌ 단계별 루틴이 실패하여 중단되었습니다.`);
            this.#currentStepIndex = -1; // Ready for new routine
        }
        return overallSuccess;
    }
}

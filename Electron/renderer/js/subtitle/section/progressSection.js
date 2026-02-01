export class ProgressSection {
    #element;
    #progressDisplay;

    // Animation state for loading (dots + timer)
    #loadingInterval = null;

    // Animation state for smoothing percentage
    #targetPercent = 0;
    #currentPercent = 0;
    #animationFrameId = null;
    #currentText = '';

    constructor(sectionElement) {
        this.#element = sectionElement;
        this.#progressDisplay = sectionElement.querySelector('#progressSection');

        this.reset();
        this.#bindEvents();
    }

    #bindEvents() {
        if (window.electronAPI && window.electronAPI.python) {
            window.electronAPI.python.onProgress((logLine) => {
                this.#parseAndDisplay(logLine);
            });
        }
    }

    #parseAndDisplay(logLine) {
        // Expected format: [PROGRESS] percentage=15.4 start=0.00 end=4.00 text=Hello world
        // Or simple text updates: [INFO] ...

        try {
            // Check for progress format
            const textMatch = logLine.match(/text=(.*)/);
            const startMatch = logLine.match(/start=([\d.]+)/);
            const percentMatch = logLine.match(/percentage=([\d.]+)/);

            if (textMatch) {
                // It's a progress update
                const text = textMatch[1].trim(); // trim to avoid extra spaces
                const start = startMatch ? parseFloat(startMatch[1]).toFixed(1) : '?';
                const percent = percentMatch ? parseFloat(percentMatch[1]) : 0; // Keep as number for smoothing

                // 1. Update text immediately (stored for the animation loop)
                this.#displayProgressText(start, text);

                // 2. Update percentage target (if it increased) to trigger smooth animation
                if (percent > this.#targetPercent) {
                    this.#targetPercent = percent;
                    this.#startProgressAnimation(); // Ensure loop is running
                }

                // If loading animation was running (e.g. from "Starting..."), stop it now
                this.#stopLoadingAnimation();

            } else if (logLine.startsWith('[INFO]')) {
                const infoText = logLine.replace('[INFO]', '').trim();
                let displayMsg = infoText;
                let isLoading = false;

                // User-friendly messages
                if (infoText.includes('Loading Whisper model')) {
                    displayMsg = '모델 로딩 중 (시간이 소요됩니다)';
                    isLoading = true;
                } else if (infoText.includes('Model loaded')) {
                    displayMsg = '모델 로딩 완료. 변환 준비 중...';
                    isLoading = true;
                } else if (infoText.includes('Starting transcription')) {
                    displayMsg = '자막 변환 시작...';
                    isLoading = true;
                } else if (infoText.includes('Switching to CPU')) {
                    displayMsg = '⚠️ GPU 오류. CPU 모드로 전환 중 (잠시만 기다려주세요)';
                    isLoading = true;
                } else if (infoText.includes('Falling back to CPU')) {
                    displayMsg = '⚠️ GPU 호환성 문제 감지. CPU 안전 모드로 재시작 중';
                    isLoading = true;
                }

                // For INFO messages, we use the standard UI update, which handles "Loading..." style
                this.#updateUI(`🔔 ${displayMsg}`, isLoading);

            } else if (logLine.startsWith('[ERROR]')) {
                const errText = logLine.replace('[ERROR]', '').trim();
                this.#updateUI(`❌ 오류: ${errText}`, false);
            } else {
                // Fallback for other lines
                const cleanText = logLine.replace('[PROGRESS]', '').trim();
                this.#updateUI(cleanText, false);
            }
        } catch (e) {
            console.error('Error parsing progress:', e);
        }
    }

    // --- Smooth Progress Animation Logic ---

    #displayProgressText(start, text) {
        // Only updates the text part storage. 
        // The actual DOM update happens in #updateRawDisplay combined with the smoothed %
        this.#currentText = `[${start}s] "${text}"`;
        // Force one update immediately in case animation isn't running roughly
        this.#updateRawDisplay();
    }

    #startProgressAnimation() {
        if (this.#animationFrameId) return; // Loop already active

        const animate = () => {
            // Linear interpolation (Lerp): current moves 10% closer to target each frame
            // Provides a nice ease-out effect
            const diff = this.#targetPercent - this.#currentPercent;

            // If very close, snap to target
            if (Math.abs(diff) < 0.1) {
                this.#currentPercent = this.#targetPercent;
                this.#updateRawDisplay();
                this.#animationFrameId = null; // Stop the loop
                return;
            }

            // Move closer
            this.#currentPercent += diff * 0.05; // 5% per frame

            this.#updateRawDisplay();
            this.#animationFrameId = requestAnimationFrame(animate);
        };

        this.#animationFrameId = requestAnimationFrame(animate);
    }

    #updateRawDisplay() {
        if (this.#progressDisplay) {
            // Format: [15.4%] [12.5s] "Hello world"
            const p = this.#currentPercent.toFixed(1);

            if (this.#currentText) {
                this.#progressDisplay.textContent = `[${p}%] ${this.#currentText}`;
                this.#progressDisplay.style.color = '#3B82F6'; // Blue
            }
        }
    }

    // --- General UI & Loading Loader Logic ---

    #updateUI(message, isLoading = false) {
        if (this.#progressDisplay) {
            // Stop conflicting animations
            this.#stopLoadingAnimation();
            // Also stop progress animation if we are switching back to a status message
            if (this.#animationFrameId) {
                cancelAnimationFrame(this.#animationFrameId);
                this.#animationFrameId = null;
            }

            this.#progressDisplay.textContent = message;
            this.#progressDisplay.style.color = '#3B82F6';

            if (isLoading) {
                this.#startLoadingAnimation(message);
            }
        }
    }

    #startLoadingAnimation(baseMessage) {
        let dots = 0;
        let seconds = 0;

        // Initial state
        if (this.#progressDisplay) {
            this.#progressDisplay.textContent = `${baseMessage} (0s)`;
        }

        this.#loadingInterval = setInterval(() => {
            // Dots: . .. ... ....
            dots = (dots + 1) % 4;
            const dotStr = '.'.repeat(dots);

            // Seconds: increment every 1s (interval is 500ms, so every 2 ticks)
            const currentSeconds = Math.floor((++seconds) / 2);

            if (this.#progressDisplay) {
                this.#progressDisplay.textContent = `${baseMessage}${dotStr} (${currentSeconds}s)`;
            }
        }, 500);
    }

    #stopLoadingAnimation() {
        if (this.#loadingInterval) {
            clearInterval(this.#loadingInterval);
            this.#loadingInterval = null;
        }
    }

    reset() {
        // Clear all animations
        this.#stopLoadingAnimation();

        if (this.#animationFrameId) {
            cancelAnimationFrame(this.#animationFrameId);
            this.#animationFrameId = null;
        }

        // Reset state
        this.#targetPercent = 0;
        this.#currentPercent = 0;
        this.#currentText = '';

        if (this.#progressDisplay) {
            this.#progressDisplay.textContent = '대기 중...';
            this.#progressDisplay.style.color = '#6B7280'; // Gray
        }
    }

    refresh() {
        // Nothing to fetch
    }
}

import { write as log } from '../logger.js';

export class QueueProcessor {
    #waitingListSection;
    #isProcessing = false;
    #stopRequested = false;

    constructor(waitingListSection) {
        this.#waitingListSection = waitingListSection;
    }

    async start() {
        if (this.#isProcessing) return;
        this.#isProcessing = true;
        this.#stopRequested = false;

        log('[QueueProcessor] Processing started.');
        this.#waitingListSection.setProcessingState(true);

        try {
            while (!this.#stopRequested) {
                const nextItem = this.#waitingListSection.getNextPendingItem();
                if (!nextItem) {
                    log('[QueueProcessor] No more pending items.');
                    break;
                }

                await this.#processItem(nextItem);
            }
        } catch (error) {
            log(`[QueueProcessor] Critical error in loop: ${error.message}`);
        } finally {
            this.#isProcessing = false;
            this.#waitingListSection.setProcessingState(false);
            log('[QueueProcessor] Processing stopped.');
        }
    }

    stop() {
        if (this.#isProcessing) {
            this.#stopRequested = true;
            log('[QueueProcessor] Stop requested.');
        }
    }

    async #processItem(item) {
        const fileName = item.name;
        log(`[QueueProcessor] Starting: ${fileName}`);

        this.#waitingListSection.updateItemStatus(fileName, 'processing');

        try {
            // 1. Get full path (Assuming file exists in video directory)
            // We need the full path for Python. 
            // The item name is just the user-friendly name from the list.
            // We can get the full path by asking Electron for the video dir + filename.
            const videoDir = await window.electronAPI.paths.getAppVideoDirectory();
            const fullPath = await window.electronAPI.path.join(videoDir, fileName);

            // 2. Call Python
            const language = this.#waitingListSection.selectedLanguage;
            const result = await window.electronAPI.python.runSubtitle(fullPath, language);

            if (result.success) {
                log(`[QueueProcessor] Success: ${fileName}`);
                this.#waitingListSection.updateItemStatus(fileName, 'completed');

                // TODO: Refresh Origin List
                // We need a way to notify OriginSection to refresh.
                // Maybe emit a custom event or call a callback if provided.
                document.dispatchEvent(new CustomEvent('subtitle-file-created'));

            } else {
                log(`[QueueProcessor] Failed: ${fileName} - ${result.message}`);
                this.#waitingListSection.updateItemStatus(fileName, 'failed');
            }

        } catch (error) {
            log(`[QueueProcessor] Error processing ${fileName}: ${error.message}`);
            this.#waitingListSection.updateItemStatus(fileName, 'failed');
        }
    }
}

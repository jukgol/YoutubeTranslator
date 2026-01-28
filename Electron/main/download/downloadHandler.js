// electron/main/download/downloadHandler.js
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

const { urlManager } = require('./urlManager');
const log = require('../js/logManager'); // Adjust path as necessary based on main/index.js perspective

class DownloadHandler {
    constructor(ipcMain, appPaths) { // ipcMain for communication, appPaths for file system
        this.is_running = false;
        this.ipcMain = ipcMain;
        this.appPaths = appPaths; // This would hold paths like video_dir, origin_dir etc.

        // Placeholder for UI update function, in a real app this would use ipcMain to send to renderer
        this.updateQueueUi = () => {
            const allItems = [...urlManager.pending, ...urlManager.inProgress, ...urlManager.completed];
            const lines = [];
            for (const item of allItems) {
                lines.push(...item.toUiLines());
            }
            log.write("--- Current Download Queue UI Update (Simulated) ---");
            lines.forEach(line => log.write(line));
            log.write("-------------------------------------------------");
            // In a real Electron app, you'd use ipcMain.send to communicate with the renderer
            // e.g., this.ipcMain.emit('update-download-list', lines);
        };

        // Placeholder for clearing input, in a real app this would use ipcMain
        this.clearDownloadUrlInput = () => {
            log.write("Simulating clearing download URL input.");
            // e.g., this.ipcMain.emit('clear-url-input');
        };

        // Placeholder for refreshing folder lists, actual implementation would involve file system
        this.refreshFolderLists = async () => {
            log.write("Simulating refreshing folder lists.");
            // In a real Electron app, you would read directory contents
            // and send them to the renderer via ipcMain.
            // const videoFiles = await getFolderFiles(this.appPaths.video_dir, ['.mp4', '.mkv', '.avi']);
            // const subFiles = await getFolderFiles(this.appPaths.origin_dir, ['.srt', '.vtt']);
            // log.write(this._formatFileList(videoFiles, "🎬"));
            // log.write(this._formatFileList(subFiles, "📝"));
        };

        this._formatFileList = (fileList, icon) => {
            if (!fileList || fileList.length === 0) {
                return "파일이 없습니다.";
            }
            let lines = [];
            for (const f of fileList) {
                lines.push(`${icon} ${f}`);
                lines.push("-".repeat(25));
            }
            return lines.join("\n");
        };

        // Bind handlers for IPC calls (if used, for now just methods)
        // e.g., ipcMain.on('add-url', (event, url) => this.handleAddUrl(url));
        // e.g., ipcMain.on('start-download', () => this.startDownload());
    }

    async handleAddUrl(url) {
        const [newItem, msg] = urlManager.addUrl(url);
        log.write(msg);

        if (newItem) {
            this.clearDownloadUrlInput();
            this.updateQueueUi();
            // Asynchronously fetch title without blocking
            this._fetchTitleAsync(newItem).catch(error => {
                log.write(`[오류] 제목 가져오기 실패: ${error.message}`);
                // Potentially mark item as failed or update status to reflect error
            });
        }
    }

    async _fetchTitleAsync(item) {
        try {
            // ytdl-core doesn't have a direct 'extract_info' equivalent for just title
            // but stream.info can be used. Or simply re-fetch with full download in next step.
            // For now, let's simulate fetching title by checking if it's a valid YouTube URL
            // and setting a placeholder title. A real implementation would use ytdl.getInfo.
            if (ytdl.validateURL(item.url)) {
                 const info = await ytdl.getInfo(item.url);
                 item.title = info.videoDetails.title;
            } else {
                 item.title = "유효하지 않은 YouTube URL";
            }
            log.write(`[제목 업데이트] ${item.url} -> ${item.title}`);
            this.updateQueueUi();
        } catch (error) {
            log.write(`[오류] 제목 가져오기 실패 for ${item.url}: ${error.message}`);
            // console.error(error); // Log actual error for debugging
        }
    }

    startDownload() {
        if (this.is_running) {
            log.write("이미 작업이 진행 중입니다.");
            return;
        }

        this.is_running = true;
        // Run the download process asynchronously
        this._runDownloadProcess().finally(() => {
            this.is_running = false;
            log.write("모든 작업을 마쳤습니다.");
            this.updateQueueUi();
        });
    }

    async _runDownloadProcess() {
        try {
            while (this.is_running) {
                const item = urlManager.getNext();
                if (!item) {
                    break; // No more items in the pending queue
                }

                item.status = "다운로드 중";
                this.updateQueueUi();

                try {
                    // Simulate download or use ytdl-core
                    const outputFilePath = path.join(this.appPaths.video_dir, `${item.title || 'video'}.mp4`);
                    const writeStream = fs.createWriteStream(outputFilePath);

                    const videoStream = ytdl(item.url, { quality: 'highestvideo' });
                    // Additional streams for audio and then merge, or just 'highest' quality
                    // For simplicity, let's just download highest quality directly.
                    
                    videoStream.pipe(writeStream);

                    await new Promise((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);
                        videoStream.on('error', reject);

                        // Optional: Add progress reporting
                        let downloadedBytes = 0;
                        let totalBytes = 0;
                        videoStream.on('info', (info, format) => {
                            totalBytes = parseInt(format.contentLength);
                            log.write(`[다운로드 시작] ${item.title} - ${totalBytes ? (totalBytes / (1024 * 1024)).toFixed(2) + 'MB' : '알 수 없음'}`);
                        });
                        videoStream.on('data', chunk => {
                            downloadedBytes += chunk.length;
                            if (totalBytes) {
                                const percentage = (downloadedBytes / totalBytes * 100).toFixed(2);
                                log.write(`[진행] ${item.title}: ${percentage}%`, true); // true for replace
                            }
                        });
                    });

                    // Successfully downloaded
                    urlManager.markAsDone(item);
                    log.write(`🎉 [성공] ${item.title} 다운로드 완료!`);
                } catch (error) {
                    log.write(`❌ [오류] ${item.title} 다운로드 실패: ${error.message}`);
                    urlManager.markAsFailed(item);
                }
                this.updateQueueUi();
                this.refreshFolderLists();
                // Add a small delay to prevent busy-looping if queue is empty quickly
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        } catch (error) {
            log.write(`[오류] 다운로드 프로세스 중 예기치 않은 오류 발생: ${error.message}`);
        } finally {
            this.is_running = false;
            log.write("모든 작업을 마쳤습니다.");
            this.updateQueueUi();
        }
    }
}

module.exports = {
    DownloadHandler
};

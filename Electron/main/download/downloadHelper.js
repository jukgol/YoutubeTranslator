// electron/main/download/downloadHelper.js
const ytdl = require('ytdl-core');
const path = require('path');
const fs = require('fs');

const { urlManager } = require('./urlManager');
const log = require('../js/logManager');

// _fetchTitleAsync 함수 복구
exports._fetchTitleAsync = async (targetUrl, itemToUpdate) => { // 시그니처 변경
    try {
        if (ytdl.validateURL(targetUrl)) {
             const info = await ytdl.getInfo(targetUrl);
             itemToUpdate.title = info.videoDetails.title;
        } else {
             itemToUpdate.title = "유효하지 않은 YouTube URL";
        }
        log.write(`[제목 업데이트] ${targetUrl} -> ${itemToUpdate.title}`);
    } catch (error) {
        log.write(`[오류] 제목 가져오기 실패 for ${targetUrl}: ${error.message}`);
    }
};

exports.startDownload = async (appPaths) => { // appPaths를 인자로 받도록 변경
    log.write("다운로드 작업을 시작합니다.");
    await exports._runDownloadProcess(appPaths); // exports를 통해 참조
    log.write("모든 작업을 마쳤습니다.");
};
exports._runDownloadProcess = async (appPaths) => {
    try {
        const item = urlManager.getNext();
        if (!item) {
            log.write("대기열에 더 이상 아이템이 없습니다.");
            return;
        }

        item.status = "다운로드 중";

        try {
            const outputFilePath = path.join(appPaths.video_dir, `${item.title || 'video'}.mp4`);
            const writeStream = fs.createWriteStream(outputFilePath);

            const videoStream = ytdl(item.url, { quality: 'highestvideo' });
            
            videoStream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                videoStream.on('error', reject);

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
                        log.write(`[진행] ${item.title}: ${percentage}%`, true);
                    }
                });
            });

            urlManager.markAsDone(item);
            log.write(`🎉 [성공] ${item.title} 다운로드 완료!`);
        } catch (error) {
            log.write(`❌ [오류] ${item.title} 다운로드 실패: ${error.message}`);
            urlManager.markAsFailed(item);
        }
    } catch (error) {
        log.write(`[오류] 다운로드 프로세스 중 예기치 않은 오류 발생: ${error.message}`);
    } finally {
        // ...
    }
};

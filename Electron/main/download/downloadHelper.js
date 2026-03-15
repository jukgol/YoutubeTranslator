const ytdlp = require('yt-dlp-exec');
const path = require('path');
const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv');
const fs = require('fs');

// yt-dlp 옵션 구성을 위한 헬퍼 함수
const getOptions = (targetUrl) => {
    const options = {
        noCheckCertificates: true,
        jsRuntimes: 'node',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    };

    // URL에 따라 Referer 설정
    if (targetUrl.includes('youtube.com') || targetUrl.includes('youtu.be')) {
        options.referer = 'https://www.youtube.com/';
    } else if (targetUrl.includes('dailymotion.com') || targetUrl.includes('dai.ly')) {
        options.referer = 'https://www.dailymotion.com/';
    }

    // 쿠키 파일이 존재하면 사용 (권장)
    if (fs.existsSync(appEnv.pathData.cookieFile)) {
        options.cookies = appEnv.pathData.cookieFile;
    }

    return options;
};

// UrlManager에서 호출할 제목 가져오기 함수
exports._fetchTitleAsync = async (targetUrl, itemToUpdate) => {
    try {
        const options = getOptions(targetUrl);
        options.dumpSingleJson = true;

        const info = await ytdlp(targetUrl, options);

        if (info && info.title) {
            itemToUpdate.title = info.title;
        } else {
            itemToUpdate.title = "제목을 찾을 수 없음";
        }

        log.write(`[제목 업데이트] ${targetUrl} -> ${itemToUpdate.title}`);
    } catch (error) {
        itemToUpdate.title = "유효하지 않은 URL 또는 접근 제한";
        log.write(`[오류] 제목 가져오기 실패: ${error.message}`);
    }
};

exports._fetchPlaylistUrls = async (playlistUrl) => {
    try {
        log.write(`▶ [플레이리스트 분석 시작] ${playlistUrl}`);
        const options = getOptions(playlistUrl);
        options.dumpSingleJson = true;
        options.flatPlaylist = true;

        const info = await ytdlp(playlistUrl, options);

        if (info && info.entries) {
            log.write(`[성공] 플레이리스트 분석 완료: ${info.entries.length}개 항목 발견`);
            return info.entries.map(entry => {
                // entry.url이 이미 전체 URL인 경우(최신 yt-dlp)와 ID만 있는 경우 모두 대응
                let videoUrl = entry.url || entry.id;
                if (videoUrl && !videoUrl.startsWith('http')) {
                    videoUrl = `https://www.youtube.com/watch?v=${videoUrl}`;
                }
                return {
                    url: videoUrl,
                    title: entry.title || "제목 없음"
                };
            });
        }
        return [];
    } catch (error) {
        log.write(`❌ [실패] 플레이리스트 분석 오류: ${error.message}`);
        throw error;
    }
};

exports._runDownloadProcess = async (url, title, quality, downloadSubs) => {
    const { ipcMain } = require('electron');

    try {
        log.write(`▶ [다운로드 시작 (Python)] ${title} (화질: ${quality}, 자막: ${downloadSubs})`);

        let formatOption = 'bestvideo+bestaudio/best';
        if (quality && quality !== 'best') {
            formatOption = `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}][ext=mp4]/best`;
        } else {
            formatOption = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }

        const outputTmpl = path.join(appEnv.pathData.videoDir, '%(title)s.%(ext)s');

        // Note: We need to use a way to call the IPC handler from the main process.
        // Since we are already in the main process, we can directly find the handler.
        // However, the cleanest way in this architecture is to treat it as a service.
        
        // We will call the logic we just added to pythonHandlers via a small shim or direct invoke
        // For simplicity, let's assume we can trigger the same logic.
        
        // Actually, let's just use the ipcMain.handle logic indirectly or refactor pythonHandlers to export the function.
        // For now, I'll use a direct internal call if possible, but the user requested "porting to python".
        
        const { ipcMain } = require('electron');
        // We use a mock event for the sender since we are calling from main
        const result = await new Promise((resolve) => {
            // Since we're in Main, we can't easily "invoke" our own ipcMain handlers directly 
            // like a renderer would. We should have exported the core logic function.
            // Let's go back and export the core runner from pythonHandlers.js.
            const { runPythonDownload } = require('../ipc/pythonDownloadHandlers');
            runPythonDownload(url, outputTmpl, formatOption, downloadSubs, downloadSubs, (progressMsg) => {
                // Parse "[PROGRESS] 10.5% of 100MiB"
                const percentMatch = progressMsg.match(/(\d+\.\d+)%/);
                const sizeMatch = progressMsg.match(/of ([\w\.]+)/);
                
                if (percentMatch) {
                    const percentage = percentMatch[1];
                    const totalSize = sizeMatch ? sizeMatch[1] : '';
                    const sizeInfo = totalSize ? ` / 수신: ${totalSize}` : '';
                    
                    // Combine into one replacing line
                    log.write(`[진행] ${title}: ${percentage}%${sizeInfo}`, true);
                }
            }).then(resolve);
        });

        if (result.success) {
            log.write(`🎉 [성공] ${title} 다운로드 완료! (화질: ${quality}, 자막: ${downloadSubs})`, true);
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        log.write(`❌ [실패] ${title}: ${error.message}`);
        throw error;
    }
};
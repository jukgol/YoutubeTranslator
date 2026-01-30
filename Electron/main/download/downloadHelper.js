// electron/main/download/downloadHelper.js
const ytdlp = require('yt-dlp-exec');
const path = require('path'); 

const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv'); 

// UrlManager에서 호출할 제목 가져오기 함수
exports._fetchTitleAsync = async (targetUrl, itemToUpdate) => {
    try {
        // 403 방지를 위해 appEnv의 쿠키 설정 활용
        const info = await ytdlp(targetUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,            
        });

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

exports._runDownloadProcess = async (url, title) => {
    try {
        log.write(`▶ [다운로드 시작] ${title}`);

        const subprocess = ytdlp.exec(url, {
            output: path.join(appEnv.pathData.videoDir, '%(title)s.%(ext)s'),
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            writeSubs: true,
            writeAutoSubs: true,
            subLangs: 'zh-Hans,en,ko,id,zh',
            subFormat: 'srt',
            cookies: appEnv.pathData.cookieFile,
            noCheckCertificates: true,
            // 1. JS 런타임 경고 해결 (Node.js 사용 명시)
            // yt-dlp가 유튜브 시그니처를 풀기 위해 필요합니다.
            jsRuntimes: 'node',
            // 2. 봇 감지 우회를 위한 User-Agent 설정
            // 실제 브라우저인 것처럼 속입니다.
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        });

        let totalSizeLogDone = false;

        subprocess.stdout.on('data', (data) => {
            const line = data.toString();

            if (!totalSizeLogDone && line.includes('of')) {
                const sizeMatch = line.match(/(\d+\.\d+(?:KiB|MiB|GiB))/);
                if (sizeMatch) {
                    const totalSize = sizeMatch[1];
                    log.write(`[정보] ${title} - 용량: ${totalSize}`);
                    totalSizeLogDone = true;
                }
            }

            if (line.includes('[download]') && line.includes('%')) {
                const percentMatch = line.match(/(\d+\.\d+)%/);
                if (percentMatch) {
                    const percentage = percentMatch[1];
                    log.write(`[진행] ${title}: ${percentage}%`, true);
                }
            }
        });

        await subprocess;

        log.write(`🎉 [성공] ${title} 다운로드 완료!`);
        return true;
    } catch (error) {
        log.write(`❌ [실패] ${title}: ${error.message}`);
        throw error;
    }
};
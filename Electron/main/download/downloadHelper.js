// electron/main/download/downloadHelper.js
const ytdlp = require('yt-dlp-exec');
const path = require('path');

const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv');

// UrlManager에서 호출할 제목 가져오기 함수
exports._fetchTitleAsync = async (targetUrl, itemToUpdate) => {
    try {
        // 403 방지를 위해 appEnv의 쿠키 및 User-Agent 설정 추가
        const info = await ytdlp(targetUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            // cookies: appEnv.pathData.cookieFile, // 401 Unauthorized 방지를 위해 제목 가져올 때는 쿠키 미사용
            jsRuntimes: 'node',                  // JS 런타임 설정
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            referer: 'https://www.dailymotion.com/' // Referer 추가
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

exports._runDownloadProcess = async (url, title, quality, downloadSubs) => {
    try {
        log.write(`▶ [다운로드 시작] ${title} (화질: ${quality}, 자막: ${downloadSubs})`);

        let formatOption = 'bestvideo+bestaudio/best';

        if (quality && quality !== 'best') {
            // 선택한 해상도 이하 중 최고 화질 + 오디오, 없으면 best
            formatOption = `bestvideo[height<=${quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${quality}][ext=mp4]/best`;
        } else {
            // 기존 Best 옵션 (mp4 선호)
            formatOption = 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best';
        }

        const options = {
            output: path.join(appEnv.pathData.videoDir, '%(title)s.%(ext)s'),
            format: formatOption,
            // cookies: appEnv.pathData.cookieFile, // 401 Error 방지
            noCheckCertificates: true,
            // 1. JS 런타임 경고 해결 (Node.js 사용 명시)
            // yt-dlp가 유튜브 시그니처를 풀기 위해 필요합니다.
            jsRuntimes: 'node',
            // 2. 봇 감지 우회를 위한 User-Agent 설정
            // 실제 브라우저인 것처럼 속입니다.
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            referer: 'https://www.dailymotion.com/', // Referer 추가
            // 자막 옵션 조건부 설정
            writeSubs: downloadSubs,
            writeAutoSubs: downloadSubs,
        };

        if (downloadSubs) {
            options.subLangs = 'zh-Hans,en,ko,id,zh';
            options.subFormat = 'srt';
        }

        const subprocess = ytdlp.exec(url, options);

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
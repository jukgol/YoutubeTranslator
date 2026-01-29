// electron/main/download/downloadHelper.js
const ytdlp = require('yt-dlp-exec');

const log = require('../js/logManager');

// _fetchTitleAsync 함수 복구
exports._fetchTitleAsync = async (targetUrl, itemToUpdate) => {
    try {
        // yt-dlp를 사용하여 비디오 정보(JSON)만 빠르게 긁어옵니다.
        // --dump-single-json 옵션이 파이썬의 extract_info(download=False)와 같습니다.
        const info = await ytdlp(targetUrl, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            // 403 방지를 위해 여기서도 쿠키를 쓰는게 안전합니다.
            cookiefile: itemToUpdate.cookie_file 
        });

        if (info && info.title) {
            itemToUpdate.title = info.title;
        } else {
            itemToUpdate.title = "제목을 찾을 수 없음";
        }

        log.write(`[제목 업데이트] ${targetUrl} -> ${itemToUpdate.title}`);
    } catch (error) {
        // URL이 유효하지 않거나 차단된 경우 에러 발생
        itemToUpdate.title = "유효하지 않은 URL 또는 접근 제한";
        log.write(`[오류] 제목 가져오기 실패: ${error.message}`);
    }
};


exports._runDownloadProcess = async (appPaths, url, title) => {
    try {
        log.write(`▶ [다운로드 시작] ${title}`);

        const subprocess = ytdlp.exec(url, {
            output: path.join(appPaths.video_dir, '%(title)s.%(ext)s'),
            format: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            writeSubs: true,
            writeAutoSubs: true,
            subLangs: 'zh-Hans,en,ko,id,zh',
            subFormat: 'srt',
            cookiefile: appPaths.cookie_file,
            noCheckCertificates: true,
        });

        let totalSizeLogDone = false;

        // yt-dlp가 화면에 뿌리는 글자들을 한 줄씩 읽습니다.
        subprocess.stdout.on('data', (data) => {
            const line = data.toString();

            // 1. 전체 용량 정보 파싱 (기존 'info' 이벤트 역할)
            if (!totalSizeLogDone && line.includes('of')) {
                const sizeMatch = line.match(/(\d+\.\d+(?:KiB|MiB|GiB))/);
                if (sizeMatch) {
                    const totalSize = sizeMatch[1];
                    log.write(`[정보] ${title} - 용량: ${totalSize}`);
                    totalSizeLogDone = true;
                }
            }

            // 2. 진행률 퍼센트 파싱 (기존 'data' 이벤트 역할)
            if (line.includes('[download]') && line.includes('%')) {
                const percentMatch = line.match(/(\d+\.\d+)%/);
                if (percentMatch) {
                    const percentage = percentMatch[1];
                    // 기존처럼 replace=true를 주어 한 줄에서 갱신
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
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

        const options = getOptions(url);
        options.output = path.join(appEnv.pathData.videoDir, '%(title)s.%(ext)s');
        options.format = formatOption;
        
        // 자막 옵션 조건부 설정
        options.writeSubs = downloadSubs;
        options.writeAutoSubs = downloadSubs;

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
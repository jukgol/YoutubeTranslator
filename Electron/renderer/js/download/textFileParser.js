// Electron/renderer/js/download/textFileParser.js

/**
 * txt 파일(File 객체)을 읽어 줄바꿈 단위로 정제된 URL/텍스트 배열을 반환합니다.
 * @param {File} file 
 * @returns {Promise<string[]>}
 */
export function parseUrlsFromTextFile(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            return resolve([]);
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result || '';
            let lines = content.match(/https?:\/\/[^\s"',;]+/gi);
            if (!lines || lines.length === 0) {
                lines = content
                    .split(/[\r\n\s,;]+/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0);
            }
            resolve(lines);
        };
        reader.onerror = (error) => {
            console.error('텍스트 파일 읽기 오류:', error);
            reject(error);
        };
        reader.readAsText(file, 'UTF-8');
    });
}

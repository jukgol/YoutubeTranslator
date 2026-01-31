const fs = require('fs').promises;
const path = require('path');
const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv'); // Import appEnv singleton

/**
 * 주어진 파일 내에서 누락된 숫자 인덱스를 확인합니다.
 * 파일의 각 줄이 순수한 숫자이면 해당 숫자를 인덱스로 간주합니다.
 *
 * @param {string} filePath - 확인할 파일의 경로.
 * @param {string} label - 로그 메시지에 사용할 레이블 (예: "원문(A)", "번역문(B)").
 * @returns {Promise<boolean>} - 누락된 인덱스가 없으면 true, 있으면 false.
 */
async function checkMissingIndices(filePath, label) {
    const indices = [];
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const lines = fileContent.split('\n');

        for (const line of lines) {
            const cleanLine = line.trim();
            if (/^\d+$/.test(cleanLine)) { // Check if line is purely digits
                indices.push(parseInt(cleanLine, 10));
            }
        }

        if (indices.length === 0) {
            log.write(`⚠️ ${label} 파일에 인덱스(숫자 줄)가 없어 검사를 건너뜁니다.`);
            return true; // No numbers found, skip check
        }

        const maxIdx = Math.max(...indices);
        const expectedSet = new Set(Array.from({ length: maxIdx }, (_, i) => i + 1));
        const actualSet = new Set(indices);
        
        const missing = Array.from(expectedSet).filter(idx => !actualSet.has(idx)).sort((a, b) => a - b);
        
        if (missing.length > 0) {
            log.write(`❌ ${label} 내에 빠진 번호가 있습니다: ${missing.join(', ')}`);
            return { success: false, finalSrtFile: null };
        }
        log.write(`✅ ${label} 파일의 인덱스 검사 완료: 누락된 번호 없음.`);
        return true;
    } catch (e) {
        log.write(`❌ 인덱스 검사 중 에러 발생 (${label}): ${e.message}`);
        return false;
    }
}

/**
 * raw_sections의 각 문단 첫 줄이 1부터 시작하는 연속된 숫자인지 확인합니다.
 *
 * @param {Array<string>} rawSections - 번역된 텍스트의 원시 섹션 배열.
 * @returns {Promise<boolean>} - 모든 인덱스가 순차적이면 true, 그렇지 않으면 false.
 */
async function validateTranslatedIndices(rawSections) {
    let expectedIdx = 1;
    let success = true;

    log.write(`🔎 번역본 인덱스 순서 검사 시작 (총 ${rawSections.length}개 문단)`);

    for (let i = 0; i < rawSections.length; i++) {
        const section = rawSections[i];
        const lines = section.split('\n').map(line => line.trim()).filter(line => line); // 빈 줄 제외

        if (lines.length === 0) {
            continue; // 완전히 빈 문단은 건너뜀
        }

        const firstLine = lines[0];
        if (/^\d+$/.test(firstLine)) { // 첫 번째 줄이 숫자인지 확인
            const currentIdx = parseInt(firstLine, 10);
            
            if (currentIdx !== expectedIdx) {
                log.write(`❌ 순서 오류: ${i + 1}번째 문단에서 번호 ${expectedIdx}를 예상했으나 ${currentIdx}가 발견되었습니다.`);
                success = false;
                expectedIdx = currentIdx; // 다음 검사를 위해 인덱스 강제 동기화 (Python 코드와 유사)
            }
        } else {
            log.write(`⚠️ 경고: ${i + 1}번째 문단이 숫자로 시작하지 않습니다. 내용 일부: '${firstLine.substring(0, 15)}...'`);
            success = false;
        }
        
        expectedIdx += 1;
    }

    if (success) {
        log.write("✅ 모든 번역본 인덱스가 순서대로 잘 배치되어 있습니다.");
    } else {
        log.write("⚠️ 인덱스 불일치가 발견되었습니다. 파일을 확인해 주세요.");
    }
    
    return success;
}

/**
 * 결합된 텍스트 파일과 원본 SRT 파일을 기반으로 최종 SRT 파일을 생성합니다.
 *
 * @param {string} combinedTextPath - 번역된 결합 텍스트 파일의 경로.
 * @param {string} originSrtPath - 원본 SRT 파일의 경로.
 * @returns {Promise<boolean>} - 성공적으로 생성되면 true, 그렇지 않으면 false.
 */
async function combineTimelineLogic(combinedTextPath, originSrtPath) { // resultDir removed from parameters
    try {
        // --- [추가 부분: 작업 시작 전 인덱스 전수 검사] ---
        log.write(`🔎 타임라인 결합 전 인덱스 검사 시작...`);
        
        const checkA = await checkMissingIndices(originSrtPath, "원문(A)");
        const checkB = await checkMissingIndices(combinedTextPath, "번역문(B)");
        
        if (!checkA || !checkB) {
            log.write("⚠️ 인덱스 번호가 일치하지 않아 작업을 중단합니다. 파일을 수정해 주세요.");
            return { success: false, finalSrtFile: null };
        }
        // ----------------------------------------------

        // 1. 원본 SRT에서 타임라인 정보만 추출 (리스트 A)
        const originContent = await fs.readFile(originSrtPath, 'utf-8');
        const timestampPattern = /(\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3})/g;
        const timestamps = [...originContent.matchAll(timestampPattern)].map(match => match[1]);

        // 2. 번역문 로드 및 전처리 (리스트 B)
        const content = await fs.readFile(combinedTextPath, 'utf-8');
        const rawSections = content.trim().split(/\n\s*\n+/);
            
        await validateTranslatedIndices(rawSections); // For logging warnings, return value not explicitly used in Python

        const translatedLines = [];
        for (const section of rawSections) {
            let cleanText = section.trim();
            if (!cleanText) {
                continue;
            }
            
            const lines = cleanText.split('\n');
            if (/^\d+$/.test(lines[0].trim())) { // 첫 줄이 숫자인지 확인
                cleanText = lines.slice(1).join('\n').trim();
            }
            
            translatedLines.push(cleanText);
        }

        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate asyncio.sleep(0.1)

        // ------------------------------
        // 3. 상세 비교 로그 출력
        log.write(`📊 [비교 시작] 타임라인(A) 개수: ${timestamps.length}개 / 번역문(B) 개수: ${translatedLines.length}개`);

        if (timestamps.length !== translatedLines.length) {
            log.write("❌ [불일치 상세 정보] 타임라인과 번역문 개수가 일치하지 않습니다.");
            return { success: false, finalSrtFile: null };
        }
        // 4. SRT 조립
        const finalSrt = [];
        for (let i = 0; i < timestamps.length; i++) {
            finalSrt.push(String(i + 1)); // Index
            finalSrt.push(timestamps[i]); // Timestamp
            finalSrt.push(translatedLines[i]); // Translated text
            finalSrt.push(""); // Empty line for SRT format
        }

        // 5. 저장
        const fileName = path.basename(originSrtPath);
        const outputPath = path.join(appEnv.pathData.resultFinalDir, fileName); // Use appEnv.pathData.resultFinalDir
        
        // Ensure resultDir exists
        await fs.mkdir(appEnv.pathData.resultFinalDir, { recursive: true }); // Use appEnv.pathData.resultFinalDir

        await fs.writeFile(outputPath, finalSrt.join('\n'), 'utf-8');

        log.write(`✅ 최종 자막 생성 완료: ${outputPath}`);
        return { success: true, finalSrtFile: outputPath };

    } catch (e) {
        log.write(`❌ 결합 에러: ${e.message}`);
        return { success: false, finalSrtFile: null };
    }
}

module.exports = {
    combineTimelineLogic,
};

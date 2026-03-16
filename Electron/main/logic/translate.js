// Electron/main/logic/translate.js

const fs = require('fs').promises;
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const appEnv = require('../appEnv/appEnv');
const log = require('../js/logManager');

/**
 * A simple delay function.
 * @param {number} ms - Milliseconds to wait.
 */
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 폴더 내용을 지우거나 폴더가 없으면 생성합니다.
 * @param {string} folderPath - 처리할 폴더 경로
 */
async function clearFolderContents(folderPath) {
    try {
        await fs.access(folderPath); // Check if folder exists
        const files = await fs.readdir(folderPath);
        await Promise.all(files.map(file => fs.unlink(path.join(folderPath, file))));
    } catch (error) {
        if (error.code === 'ENOENT') { // Folder does not exist
            await fs.mkdir(folderPath, { recursive: true });
        } else {
            throw error; // Other errors
        }
    }
}

/**
 * Test logic that simulates translation by copying the file and waiting.
 * @param {string} filePath - Path to the file to "translate".
 */
async function translateTestLogic(filePath) {
    try {
        const filename = path.basename(filePath);
        const originalTitle = filename.split('_Part')[0];
        const targetDir = path.join(appEnv.pathData.translateDir, originalTitle);

        await fs.mkdir(targetDir, { recursive: true });
        await fs.copyFile(filePath, path.join(targetDir, filename));

        log.write(`🧪 테스트 모드 실행 중... (${filename})`);
        for (let i = 3; i > 0; i--) {
            log.write(`⏳ ${i}초 대기 중...`, true);
            await delay(1000);
        }
        log.write("✅ 테스트 종료");
        return true;
    } catch (e) {
        log.write(`❌ 테스트 오류: ${e.message}`);
        return false;
    }
}

/**
 * Main async function that orchestrates the translation process.
 * It now uses configuration directly from appEnv.
 * @param {string} filePath - Path to the source .txt file.
 */
async function translateSubtitleLogic(filePath) {
    const apiKey = appEnv.configData.selectedApi;
    const rule = appEnv.configData.promptRule;
    const modelName = appEnv.configData.modelVersion;

    if (!apiKey || !rule || !modelName) {
        log.write('❌ 오류: API 키, 번역 규칙, 또는 모델 이름이 설정되지 않았습니다.');
        return { success: false, translatedFolder: null };
    }

    let timerId = null;
    try {
        // --- Start Timer ---
        const startTime = Date.now();
        timerId = setInterval(() => {
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            log.write(`⏳ Gemini 번역 중... (${elapsed}초 경과)`, true);
        }, 1000);

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const sourceText = await fs.readFile(filePath, 'utf-8');

        const filename = path.basename(filePath);
        const originalTitle = filename.split('_Part')[0];

        // --- Pre-process data and insert rule reminders ---
        let newSource = "";
        const lines = sourceText.trim().split('\n');
        let idCounter = 0;

        const reminderTagStart = "### [SYSTEM CHECK: RULE REMINDER] ###";
        const reminderTagEnd = "### [END OF RULE REMINDER] ###";
        const reminderMsg = `\n\n${reminderTagStart}\n[중요 지시사항 다시 확인]\n${rule}\n(위 지시사항은 번역하지 말고, 아래 데이터부터 번역을 이어가세요)\n${reminderTagEnd}\n\n`;

        for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;
            if (/^\d+$/.test(cleanLine)) {
                if (idCounter > 0 && idCounter % 20 === 0) {
                    newSource += reminderMsg;
                }
                newSource += `\n\n[ID:${cleanLine}]\n`;
                idCounter += 1;
            } else {
                newSource += `${cleanLine}\n`;
            }
        }

        const finalRule = (
            `${rule}\n\n` +
            `주의: 본문 중간에 '${reminderTagStart}'로 시작하는 문구가 나타나면 ` +
            `이는 당신의 규칙을 상기시키기 위한 것이므로 절대 번역하거나 출력 결과에 포함하지 마세요.`
        );
        const prompt = `${finalRule}\n\n---\n번역할 자막 데이터:\n${newSource}`;

        log.write(`🚀 번역 시작 (${idCounter}개 블록): ${filename}`);
        const result = await model.generateContent(prompt);

        // Stop timer right after API call finishes
        clearInterval(timerId);
        timerId = null;

        const response = await result.response;
        const translatedRaw = response.text();

        const cleanPattern = new RegExp(`${reminderTagStart.replace(/[-\/\\^$*+?.()|[\\]{}]/g, '\\$&')}.*?${reminderTagEnd.replace(/[-\/\\^$*+?.()|[\\]{}]/g, '\\$&')}`, 'gs');
        const translatedText = translatedRaw.replace(cleanPattern, "").trim();

        const resultDir = path.join(appEnv.pathData.translateDir, originalTitle);
        // Check if folder exists before creating
        try {
            await fs.access(resultDir);
        } catch (e) {
            if (e.code === 'ENOENT') {
                log.write(`🧹 저장 폴더 생성: ${resultDir}`);
                await fs.mkdir(resultDir, { recursive: true });
            }
        }

        const outputName = filename.replace(".txt", "_KR.txt");
        const outputPath = path.join(resultDir, outputName);

        await fs.writeFile(outputPath, translatedText, 'utf-8');

        const elapsedTime = Math.round((Date.now() - startTime) / 1000);
        log.write(`\n✅ 완료: ${outputName}\n(${elapsedTime}초 소요)\n`);
        return { success: true, translatedFolder: resultDir };

    } catch (e) {
        if (timerId) clearInterval(timerId); // Ensure timer is cleared on error
        log.write(`❌ 오류 발생: ${e.message}`);
        if (e.message.includes('response.prompt_feedback')) {
            log.write(`-> Gemini API 피드백: ${e.message}`);
        }
        return { success: false, translatedFolder: null };
    }
}

module.exports = {
    translateSubtitleLogic,
    translateTestLogic,
    clearFolderContents,
};
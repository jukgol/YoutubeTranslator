const fs = require('fs').promises;
const path = require('path');
const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv'); // Import appEnv singleton

/**
 * 번역된 파트들을 하나의 파일로 결합합니다.
 * @param {string} folderName - 번역된 파트가 있는 폴더 이름 (예: 비디오의 기본 이름).
 * @returns {Promise<boolean>} - 성공적으로 결합되면 true, 그렇지 않으면 false.
 */
async function combinePartsLogic(folderName) { // translateDir, combineDir removed from parameters
    try {
        const sourceFolder = path.join(appEnv.pathData.translateDir, folderName); // Use appEnv.pathData.translateDir

        try {
            await fs.access(sourceFolder); // Check if folder exists
        } catch (error) {
            if (error.code === 'ENOENT') {
                log.write(`❌ 폴더를 찾을 수 없습니다: ${sourceFolder}`);
                return false;
            }
            throw error; // Re-throw other errors
        }

        let files = await fs.readdir(sourceFolder);
        files = files
            .filter(f => f.toLowerCase().endsWith('.txt'))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        if (files.length === 0) {
            log.write(`⚠️ ${folderName} 폴더에 합칠 파일이 없습니다.`);
            return { success: false, message: `${folderName} 폴더에 합칠 파일이 없습니다.`, combinedFile: null };
        }

        log.write(`🚀 ${folderName} 파트 합치기 시작 (총 ${files.length}개 파트)`);

        const combinedContentParts = [];
        for (let i = 0; i < files.length; i++) {
            const filename = files[i];
            const filePath = path.join(sourceFolder, filename);
            let content = await fs.readFile(filePath, 'utf-8');
            content = content.trim();

            // Python re.sub(r'[\[]ID:(\d+)[\]]\s*', r'\n\1\n', content).strip()
            // JavaScript equivalent:
            content = content.replace(/[\[]ID:(\d+)[\]]\s*/g, '\n$1\n').trim();

            combinedContentParts.push(content);

            if (i < files.length - 1) {
                combinedContentParts.push("\n\n");
            }
        }

        const outputPath = path.join(appEnv.pathData.combineDir, `${folderName}.txt`); // Use appEnv.pathData.combineDir

        // Ensure combineDir exists
        await fs.mkdir(appEnv.pathData.combineDir, { recursive: true }); // Use appEnv.pathData.combineDir

        await fs.writeFile(outputPath, combinedContentParts.join(''), 'utf-8');

        log.write(`✅ 합치기 완료: ${outputPath}`);
        return { success: true, combinedFile: outputPath };

    } catch (e) {
        log.write(`❌ 작업 중 에러 발생: ${e.message}`);
        return { success: false, combinedFile: null };
    }
}

module.exports = {
    combinePartsLogic,
};

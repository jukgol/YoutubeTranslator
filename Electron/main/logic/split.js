const fs = require('fs').promises;
const path = require('path');
const log = require('../js/logManager');
const appEnv = require('../appEnv/appEnv'); // Import appEnv singleton

/**
 * 폴더 내용을 지우거나 폴더가 없으면 생성합니다.
 * @param {string} folderPath - 처리할 폴더 경로
 */
async function clearFolderContents(folderPath) {
    try {
        await fs.access(folderPath); // Check if folder exists
        const files = await fs.readdir(folderPath);
        await Promise.all(files.map(file => fs.unlink(path.join(folderPath, file))));
        log.write(`폴더 내용 지움: ${folderPath}`);
    } catch (error) {
        if (error.code === 'ENOENT') { // Folder does not exist
            await fs.mkdir(folderPath, { recursive: true });
            log.write(`폴더 생성: ${folderPath}`);
        } else {
            throw error; // Other errors
        }
    }
}

/**
 * 감지된 에피소드와 맵을 기반으로 자막 그룹을 라인 수로 분할합니다.
 * @param {Array<number|string>} detectedEps - 감지된 에피소드 번호 또는 "Start" 키의 정렬된 배열.
 * @param {Object} epMap - 에피소드/키에 대한 자막 라인 배열을 매핑하는 객체.
 * @param {boolean} hasStart - epMap에 "Start" 키가 있는지 여부.
 * @returns {Array<Array<Array<string>>>} - 3개의 파트로 그룹화된 자막 단위 배열.
 */
function getLineCountSplitGroups(detectedEps, epMap, hasStart = false) {
    const allUnits = [];
    const textIndex = 250; // 한 단위당 최대 라인 수

    // "Start" 부분 처리
    if (hasStart) {
        const startData = epMap.get("Start") || [];
        for (let i = 0; i < startData.length; i += textIndex) {
            allUnits.push(startData.slice(i, i + textIndex));
        }
    }

    // 일반 에피소드 처리
    for (const ep of detectedEps) {
        const epData = epMap.get(ep) || [];
        for (let i = 0; i < epData.length; i += textIndex) {
            allUnits.push(epData.slice(i, i + textIndex));
        }
    }

    // 요청하신 3개 / 3개 / 나머지 규칙 적용
    const groups = [];
    if (allUnits.length > 0) {
        groups.push(allUnits.slice(0, 3)); // Part 1 (앞의 3단위)
    }
    
    if (allUnits.length > 3) {
        groups.push(allUnits.slice(3, 6)); // Part 2 (그다음 3단위)
    }
        
    if (allUnits.length > 6) {
        groups.push(allUnits.slice(6));  // Part 3 (남은 전부)
    }

    return groups;
}


/**
 * 자막 파일을 에피소드/라인 수 기준으로 분할하고 타임라인을 제거하여 저장합니다.
 * @param {string} filePath - 원본 자막 파일 경로.
 */
async function splitSubtitleLogic(filePath) { // originDir removed from parameters
    log.write(`[분할] 자막 파일 분할 시작: ${filePath}`);
    const content = await fs.readFile(filePath, 'utf-8');
    const cleanedContent = content.replace(/^\ufeff/, ''); // BOM 제거

    const blocks = cleanedContent.trim().split('\n\n');
    
    const epMap = new Map(); // Use Map for better key handling (int vs string)
    let currentEp = "Start"; // Python default was "Start"

    for (const block of blocks) {
        const lines = block.split('\n');
        if (lines.length < 2) continue;

        const match = block.match(/=Episode (\d+)=/);
        if (match) {
            currentEp = parseInt(match[1], 10);
        }
            
        if (!epMap.has(currentEp)) {
            epMap.set(currentEp, []);
        }

        const index = lines[0];
        // Python: if '-->' in lines[1] else "\n".join(lines[1:])
        // Node.js: lines[1].includes('-->') ? lines.slice(2).join('\n') : lines.slice(1).join('\n')
        const text = lines[1].includes('-->') ? lines.slice(2).join('\n') : lines.slice(1).join('\n');
        epMap.get(currentEp).push(`${index}\n${text}`);
    }

    // Sort detected episode numbers
    const detectedEps = Array.from(epMap.keys()).filter(key => typeof key === 'number').sort((a, b) => a - b);
    
    // [수정된 부분] 라인 수 기반 그룹화 함수 호출 (ep_map 전달)
    const groups = getLineCountSplitGroups(detectedEps, epMap, epMap.has("Start"));

    const baseName = path.parse(filePath).name;
    // const parentDir = path.dirname(originDir); // Replaced with direct appEnv path
    const splitDir = appEnv.pathData.splitDir; // Use appEnv.pathData.splitDir directly
    const saveDir = path.join(splitDir, baseName);

    await clearFolderContents(saveDir);

    // 5. 파일 저장
    for (const [i, group] of groups.entries()) {
        if (group.length === 0) continue;
        
        const outputData = [];
        let totalLines = 0;
        for (const unit of group) { 
            // unit 자체가 이미 자막 텍스트 리스트이므로 바로 사용합니다.
            outputData.push(...unit);
            totalLines += unit.length; // 각 unit은 slice로 잘린 부분임
        }
        
        if (outputData.length === 0) continue;

        // [수정된 부분] 파일명에 에피소드 번호 대신 Line(인덱스 수) 표시
        const outputName = `${baseName}_Part${i + 1}_Line_${totalLines}_no_time.txt`;
        const outputPath = path.join(saveDir, outputName);
        
        await fs.writeFile(outputPath, outputData.join("\n\n"), 'utf-8');
            
        log.write(`저장 완료: ${outputName} (총 ${totalLines} 라인)`);
    }
    log.write(`[분할] 자막 파일 분할 완료: ${filePath}`);
}

module.exports = {
    splitSubtitleLogic,
};

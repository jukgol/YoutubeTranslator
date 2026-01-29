// Electron/renderer/js/download/eventHandlers.js

import { addUrl } from './ipc_url.js';
import { renderFlatList, addFlatListItem } from './listRenderers.js';
import { createItemClickHandler } from './selectionHandler.js'; 

export const setupAddUrlButtonHandler = (downloadUrlList, addUrlButton, urlInput, sharedHandleItemClick) => {
    // sharedHandleItemClick은 index.js에서 생성된 것을 받아서 사용합니다.
    const handleItemClick = sharedHandleItemClick || createItemClickHandler(); // fallback: 혹시 모를 경우 새로 생성

    addUrlButton.addEventListener('click', async () => {
        console.log('URL 추가 버튼 클릭됨 (eventHandlers.js)');
        const url = urlInput.value.trim();

        if (url) {
            addUrlButton.disabled = true;
            const newItem = await addUrl(url); 
            if (newItem) {
                console.log('URL 추가 완료:', newItem);
                // downloadItems.push(newItem); // 이 줄을 제거합니다.
                addFlatListItem(downloadUrlList, newItem.title, '영상 다운로드', handleItemClick);
            }
            urlInput.value = '';
            addUrlButton.disabled = false;
        } else {
            console.log('URL이 비어 있습니다.');
        }
    });
};
